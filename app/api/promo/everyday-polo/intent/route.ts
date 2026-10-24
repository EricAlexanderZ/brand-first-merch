import { NextResponse } from "next/server";
import { stripe, toCents } from "@/lib/stripe-server";
import { findCarrierRate } from "@/lib/delivery";
import { computeOrderAmounts, promoWeightOz, type PromoCheckoutRequest } from "@/lib/promo/everyday-polo";

// Creates the Stripe PaymentIntent for the promo checkout. The charge amount is
// recomputed server-side from the raw config — the client's totals are never trusted.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Pick<PromoCheckoutRequest, "config" | "fulfillment">;
    let fulfillment = body.fulfillment;

    // Shipping is requoted here too. The browser used to send its own
    // shipping price, and anything from $0 to $200 was accepted.
    if (fulfillment?.type === "shipping") {
      if (!fulfillment.address) {
        return NextResponse.json({ error: "An address is required." }, { status: 400 });
      }
      const rate = await findCarrierRate(fulfillment.address, promoWeightOz(body.config), fulfillment.method);
      if (!rate) {
        return NextResponse.json(
          { error: "That shipping option is no longer available. Please get rates again." },
          { status: 409 }
        );
      }
      fulfillment = { ...fulfillment, shippingPrice: rate.price };
    }

    const amounts = computeOrderAmounts(body.config, fulfillment);
    if ("error" in amounts) {
      return NextResponse.json({ error: amounts.error }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toCents(amounts.total),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      // The save route checks the order against these.
      metadata: {
        source:   "everyday-work-polo",
        subtotal: amounts.subtotal.toFixed(2),
        shipping: amounts.shippingPrice.toFixed(2),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subtotal: amounts.subtotal,
      shippingPrice: amounts.shippingPrice,
      total: amounts.total,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
