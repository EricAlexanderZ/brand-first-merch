import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendOrderConfirmation, sendAdminNewOrderAlert, sendAdminOrderSaveFailure } from "@/lib/email";
import type { CartItem } from "@/types/cart";
import { priceCart } from "@/lib/order-pricing";
import { loadPaidIntent, markIntentOrdered, toCents } from "@/lib/stripe-server";

type OrderPayload = {
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
  trackingSource?: string | null;
  /** Stripe PaymentIntent id, so a failed save can be matched to its charge. */
  paymentIntentId?: string;
};

/**
 * Tell the shop about a paid order the database refused, then answer 500.
 *
 * By the time this route runs the card has been charged, so a failed insert
 * that only reached the logs meant a customer paid for an order nobody knew
 * about. The email is the safety net.
 */
async function failSave(body: OrderPayload, reason: string) {
  try {
    await sendAdminOrderSaveFailure({ order: body, reason });
  } catch (err) {
    console.error("[api/orders] failure alert also failed:", err);
  }
  return NextResponse.json({ error: "Failed to save order." }, { status: 500 });
}

export async function POST(request: NextRequest) {
  const body: OrderPayload = await request.json();

  // ── The order must be paid for, by a payment made for this checkout ──
  // Without this, anyone could post an order here without paying at all.
  const paid = await loadPaidIntent(body.paymentIntentId, "checkout");
  if ("error" in paid) {
    return NextResponse.json({ error: paid.error }, { status: paid.status });
  }
  const intent = paid.intent;

  // One payment, one order. A refresh or a retry gets the order it already made.
  if (intent.metadata.order_number) {
    return NextResponse.json({ orderNumber: intent.metadata.order_number, duplicate: true });
  }

  // ── Every price is recomputed here, never taken from the request ──
  // The payment route charged subtotal + shipping and wrote both onto the
  // payment. The cart sent now must price to that same subtotal, so a cheap
  // payment cannot be attached to an expensive cart.
  const cart = priceCart(body.items);
  if ("error" in cart) {
    return failSave(body, `Paid, but the cart could not be priced: ${cart.error}`);
  }
  const paidSubtotal = Number(intent.metadata.subtotal);
  const shipping     = Number(intent.metadata.shipping);
  const total        = Math.round((cart.subtotal + shipping) * 100) / 100;
  if (toCents(cart.subtotal) !== toCents(paidSubtotal) || toCents(total) !== intent.amount) {
    return failSave(
      body,
      `Cart does not match the payment. Cart prices to $${cart.subtotal.toFixed(2)} + ` +
      `$${shipping.toFixed(2)} shipping; the customer paid $${(intent.amount / 100).toFixed(2)}.`
    );
  }
  if (!body.customerName?.trim() || !body.customerEmail?.trim()) {
    return failSave(body, "Paid, but the customer name or email is missing.");
  }

  // ── Generate readable order number: BFM4501, 4502, … ────
  // Prefix changed with the rebrand. The count is NOT reset: it is the
  // row count, so restarting it would remint numbers that already exist.
  const { count } = await supabaseAdmin
    .from("orders")
    .select("*", { count: "exact", head: true });

  const orderNumber = `BFM${4501 + (count ?? 0)}`;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number:     orderNumber,
      customer_name:    body.customerName,
      customer_email:   body.customerEmail,
      customer_phone:   body.customerPhone || null,
      shipping_address: body.shippingAddress,
      shipping_method:  intent.metadata.shipping_label ?? body.shippingMethod,
      shipping_price:   shipping,
      subtotal:         cart.subtotal,
      total,
      status:           "new",
      tracking_source:  body.trackingSource?.trim() || null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("[api/orders] insert order error:", orderError);
    return failSave(body, orderError?.message ?? "Order insert returned no row.");
  }

  const orderItems = body.items.map((item, i) => ({
    order_id:           order.id,
    product_type:       item.productType,
    style:              item.style,
    color:              item.color,
    quantity:           item.quantity,
    placement:          item.placement,
    details:            item.details,
    artwork_urls:       item.artworkUrls ?? [],
    price:              cart.lines[i].price,
    unit_price:         cart.lines[i].unitPrice,
    per_piece_upcharge: cart.lines[i].perPieceUpcharge,
    flat_upcharge:      cart.lines[i].flatUpcharge,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("[api/orders] insert items error:", itemsError);
    return failSave(
      body,
      `Order ${order.order_number} was created but its items did not save: ${itemsError.message}`
    );
  }

  await markIntentOrdered(intent, order.order_number);

  // ── Send emails (non-blocking) ────────────────────────────────
  const emailItems = orderItems.map((i) => ({
    productType: i.product_type,
    quantity:    i.quantity,
    price:       i.price,
  }));

  // These MUST be awaited. Vercel freezes a serverless function the moment it
  // returns a response, so an un-awaited promise is killed mid-flight and the
  // email silently never sends. It works locally only because the dev server
  // keeps running long enough for the request to finish.
  //
  // allSettled, not all: the order is already saved, so a failed email must not
  // turn a successful order into an error for the customer.
  const emailResults = await Promise.allSettled([
    sendOrderConfirmation({
      to:      body.customerEmail,
      name:    body.customerName,
      orderId: order.id,
      orderNumber: order.order_number,
      items:   emailItems,
      total,
    }),
    sendAdminNewOrderAlert({
      orderId:       order.id,
      orderNumber:   order.order_number,
      customerName:  body.customerName,
      customerEmail: body.customerEmail,
      items:         emailItems,
      total,
    }),
  ]);

  // Without this a rejected send is invisible, which is exactly how an email
  // outage goes unnoticed for weeks.
  emailResults.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `[api/order] ${i === 0 ? "customer confirmation" : "admin alert"} failed:`,
        r.reason
      );
    }
  });

  return NextResponse.json({ orderId: order.id, orderNumber: order.order_number });
}
