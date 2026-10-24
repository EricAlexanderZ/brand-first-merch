// Server use only: it holds the Stripe secret key.
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Statuses that mean the money is coming: paid, or a bank payment settling. */
const PAID_STATUSES = new Set<Stripe.PaymentIntent.Status>(["succeeded", "processing"]);

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Loads the PaymentIntent an order claims to be paid by, and checks it is.
 *
 * The order routes used to save whatever they were sent, so anyone could
 * create a "paid" order without paying. Now an order needs a real Stripe
 * payment, created by this site for this kind of checkout (`source`), that
 * has gone through.
 */
export async function loadPaidIntent(
  id: unknown,
  source: string
): Promise<{ intent: Stripe.PaymentIntent } | { error: string; status: number }> {
  if (typeof id !== "string" || !id.startsWith("pi_")) {
    return { error: "Missing payment reference.", status: 400 };
  }

  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.retrieve(id);
  } catch {
    return { error: "Payment not found.", status: 400 };
  }

  if (intent.metadata?.source !== source) {
    return { error: "Payment does not belong to this checkout.", status: 400 };
  }
  if (!PAID_STATUSES.has(intent.status)) {
    return { error: "Payment has not been completed.", status: 402 };
  }
  return { intent };
}

/**
 * Records the order number on the payment, which is also how a payment is
 * kept from paying for two orders: a payment that already carries one is
 * answered with that order instead of saving another.
 */
export async function markIntentOrdered(intent: Stripe.PaymentIntent, orderNumber: string) {
  try {
    await stripe.paymentIntents.update(intent.id, {
      metadata: { ...intent.metadata, order_number: orderNumber },
    });
  } catch (err) {
    // The order is saved; failing to tag the payment only weakens the
    // duplicate guard, so it is logged rather than failing the request.
    console.error("[stripe] could not tag payment with order number:", err);
  }
}
