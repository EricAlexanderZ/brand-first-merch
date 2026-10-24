import { NextResponse } from "next/server";
import { stripe, toCents } from "@/lib/stripe-server";
import { priceCart } from "@/lib/order-pricing";
import { findDeliveryOption, type DeliveryAddress } from "@/lib/delivery";
import type { CartItem } from "@/types/cart";

/**
 * Creates the Stripe payment for a checkout, for an amount the server works
 * out itself.
 *
 * It used to take `amount` from the browser and charge exactly that, so a
 * customer could edit the page and pay $1 for a $150 order. Now the browser
 * sends only what is being bought and which delivery option was picked; the
 * prices come from lib/order-pricing and a fresh Shippo quote.
 *
 * The subtotal and shipping charged are written onto the payment's metadata,
 * which is what /api/orders checks the saved order against.
 */
export async function POST(req: Request) {
  try {
    const { items, address, deliveryLabel } = (await req.json()) as {
      items: CartItem[];
      address: DeliveryAddress;
      deliveryLabel: string;
    };

    const cart = priceCart(items);
    if ("error" in cart) {
      return NextResponse.json({ error: cart.error }, { status: 400 });
    }

    if (!address?.line1 || !address.city || !address.state || !address.zip || !deliveryLabel) {
      return NextResponse.json({ error: "Shipping details are incomplete." }, { status: 400 });
    }

    const delivery = await findDeliveryOption(address, items, deliveryLabel);
    if (!delivery) {
      return NextResponse.json(
        { error: "That delivery option is no longer available. Please choose your delivery method again." },
        { status: 409 }
      );
    }

    const total = Math.round((cart.subtotal + delivery.price) * 100) / 100;
    if (total <= 0) {
      return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toCents(total),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        source:         "checkout",
        subtotal:       cart.subtotal.toFixed(2),
        shipping:       delivery.price.toFixed(2),
        shipping_label: delivery.label.slice(0, 450),
      },
    });

    return NextResponse.json({
      clientSecret:  paymentIntent.client_secret,
      subtotal:      cart.subtotal,
      shippingPrice: delivery.price,
      total,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
