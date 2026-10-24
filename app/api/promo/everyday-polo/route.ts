import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendOrderConfirmation, sendAdminNewOrderAlert, sendAdminOrderSaveFailure } from "@/lib/email";
import { loadPaidIntent, markIntentOrdered, toCents } from "@/lib/stripe-server";
import {
  buildLineItems,
  computeOrderAmounts,
  type PromoCheckoutRequest,
} from "@/lib/promo/everyday-polo";

// Persists a paid "Everyday Work Polo" promo order into the shared orders /
// order_items tables (so it surfaces in the existing admin panel). Totals are
// recomputed authoritatively here — the client-sent amounts are never trusted.
/** Email the shop a paid order that could not be saved, then answer 500. */
async function failSave(body: unknown, reason: string) {
  try {
    await sendAdminOrderSaveFailure({ order: body as Record<string, unknown>, reason });
  } catch (err) {
    console.error("[api/promo/everyday-polo] failure alert also failed:", err);
  }
  return NextResponse.json({ error: "Failed to save order." }, { status: 500 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as PromoCheckoutRequest & { paymentIntentId?: string };
  const { config, customer } = body;

  // ── The order must be paid for ───────────────────────────────────────────
  // Without this, anyone could post a promo order here without paying.
  const paid = await loadPaidIntent(body.paymentIntentId, "everyday-work-polo");
  if ("error" in paid) {
    return NextResponse.json({ error: paid.error }, { status: paid.status });
  }
  const intent = paid.intent;
  if (intent.metadata.order_number) {
    return NextResponse.json({ orderNumber: intent.metadata.order_number, duplicate: true });
  }

  // ── Validate + recompute the authoritative amounts ───────────────────────
  // Shipping comes from the payment, where the intent route recorded the price
  // it quoted, not from the request.
  const fulfillment = body.fulfillment && {
    ...body.fulfillment,
    shippingPrice: Number(intent.metadata.shipping ?? 0),
  };
  const amounts = computeOrderAmounts(config, fulfillment);
  if ("error" in amounts) {
    return failSave(body, `Paid, but the order is invalid: ${amounts.error}`);
  }
  if (toCents(amounts.total) !== intent.amount) {
    return failSave(
      body,
      `Order prices to $${amounts.total.toFixed(2)} but the customer paid $${(intent.amount / 100).toFixed(2)}.`
    );
  }

  if (!customer?.name?.trim() || !customer?.email?.trim()) {
    return failSave(body, "Paid, but the customer name or email is missing.");
  }

  // ── Generate readable order number: BFM4501, 4502, … ────────────────
  // Prefix changed with the rebrand. The count is NOT reset: it is the
  // row count, so restarting it would remint numbers that already exist.
  const { count } = await supabaseAdmin
    .from("orders")
    .select("*", { count: "exact", head: true });

  const orderNumber = `BFM${4501 + (count ?? 0)}`;

  const trackingSource = body.trackingSource?.trim() || null;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: customer.name.trim(),
      customer_email: customer.email.trim(),
      customer_phone: customer.phone?.trim() || null,
      shipping_address: fulfillment.address,
      shipping_method: fulfillment.method,
      shipping_price: amounts.shippingPrice,
      subtotal: amounts.subtotal,
      total: amounts.total,
      status: "new",
      tracking_source: trackingSource,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("[api/promo/everyday-polo] insert order error:", orderError);
    return failSave(body, orderError?.message ?? "Order insert returned no row.");
  }

  // ── Build the line items (authoritative pricing) ─────────────────────────
  const artworkUrls = Array.isArray(body.artworkUrls) ? body.artworkUrls.filter(Boolean) : [];
  const artworkPlacements = Array.isArray(body.artworkPlacements)
    ? body.artworkPlacements.filter(Boolean)
    : [];
  const instructions = body.instructions?.trim();

  const lineItems = buildLineItems(config).map((item) => ({
    order_id: order.id,
    product_type: item.product_type,
    style: item.style,
    color: item.color,
    quantity: item.quantity,
    placement: item.placement,
    details: {
      ...item.details,
      ...(artworkPlacements.length ? { "Logo Files": artworkPlacements.join(", ") } : {}),
      ...(instructions ? { Instructions: instructions } : {}),
    },
    artwork_urls: artworkUrls,
    price: item.price,
    unit_price: item.unit_price,
    per_piece_upcharge: item.per_piece_upcharge,
    flat_upcharge: item.flat_upcharge,
  }));

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(lineItems);

  if (itemsError) {
    console.error("[api/promo/everyday-polo] insert items error:", itemsError);
    return failSave(
      body,
      `Order ${order.order_number} was created but its items did not save: ${itemsError.message}`
    );
  }

  await markIntentOrdered(intent, order.order_number);

  // ── Send emails (non-blocking) ───────────────────────────────────────────
  const emailItems = lineItems.map((i) => ({
    productType: i.product_type,
    quantity: i.quantity,
    price: i.price,
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
      to: customer.email.trim(),
      name: customer.name.trim(),
      orderId: order.id,
      orderNumber: order.order_number,
      items: emailItems,
      total: amounts.total,
    }),
    sendAdminNewOrderAlert({
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: customer.name.trim(),
      customerEmail: customer.email.trim(),
      items: emailItems,
      total: amounts.total,
    }),
  ]);

  // Without this a rejected send is invisible, which is exactly how an email
  // outage goes unnoticed for weeks.
  emailResults.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `[api/promo-order] ${i === 0 ? "customer confirmation" : "admin alert"} failed:`,
        r.reason
      );
    }
  });

  return NextResponse.json({ orderId: order.id, orderNumber: order.order_number });
}
