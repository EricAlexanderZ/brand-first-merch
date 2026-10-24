import type { CartItem } from "@/types/cart";

/**
 * An order that has been paid for (or is being paid for) but not yet saved.
 *
 * Checkout writes it to sessionStorage just before charging the card, and the
 * confirmation page saves it. Doing the save on the confirmation page means
 * one code path for every payment method, including the ones that leave the
 * site to approve the payment and only come back via Stripe's return_url.
 */
export const PENDING_ORDER_KEY = "bfm-pending-order";

/** Where the confirmation page remembers a finished save, keyed by payment. */
export const SAVED_ORDER_PREFIX = "bfm-saved-order:";

/**
 * What checkout parks before charging: the route that saves the order, the
 * request body for it, and the email to show on the confirmation page.
 * The PaymentIntent id is added to the body when the order is saved.
 */
export type PendingOrder = {
  endpoint: "/api/orders" | "/api/promo/everyday-polo";
  customerEmail: string;
  body: Record<string, unknown>;
};

/** The body main checkout sends to /api/orders. */
export type CheckoutOrderBody = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  shippingMethod: string;
  shippingPrice: number;
  subtotal: number;
  total: number;
  items: CartItem[];
};
