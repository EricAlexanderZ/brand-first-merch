"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { PENDING_ORDER_KEY, SAVED_ORDER_PREFIX, type PendingOrder } from "@/lib/pending-order";
import { site } from "@/lib/site";

type State =
  | { kind: "working" }
  | { kind: "saved"; orderNumber: string; email: string }
  | { kind: "unsaved" }          // paid, but the save failed; the shop was emailed
  | { kind: "offline" }          // paid, but the server could not be reached at all
  | { kind: "payment-failed" }
  | { kind: "plain" };           // landed here directly, nothing to finish

/**
 * Finishes an order on the confirmation page and says what happened.
 *
 * Runs once per payment: the result is remembered under the PaymentIntent id,
 * so a refresh shows the same order number instead of saving it twice.
 */
export default function OrderFinalizer() {
  const { clearCart } = useCart();
  const [state, setState] = useState<State>({ kind: "working" });

  async function save(payment: string) {
    const pending = sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!pending) { setState({ kind: "plain" }); return; }
    setState({ kind: "working" });

    const order = JSON.parse(pending) as PendingOrder;
    const body  = JSON.stringify({ ...order.body, paymentIntentId: payment });
    let result: State = { kind: "offline" };
    // One retry, for a dropped connection only. A server error has already
    // emailed the shop the full order. (A repeat can never save twice: the
    // server answers a payment it has seen with the order it already made.)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(order.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        if (res.ok) {
          const data = await res.json();
          result = { kind: "saved", orderNumber: data.orderNumber, email: order.customerEmail };
        } else {
          result = { kind: "unsaved" };
        }
        break;
      } catch {
        // Network failure: loop round once more.
      }
    }

    // Offline keeps the pending order so "Try again" has something to send.
    if (result.kind !== "offline") {
      sessionStorage.removeItem(PENDING_ORDER_KEY);
      sessionStorage.setItem(SAVED_ORDER_PREFIX + payment, JSON.stringify(result));
    }
    setState(result);
  }

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const payment = params.get("payment_intent");
    const status  = params.get("redirect_status");

    if (!payment) { setState({ kind: "plain" }); return; }
    if (status !== "succeeded" && status !== "processing") {
      sessionStorage.removeItem(PENDING_ORDER_KEY);
      setState({ kind: "payment-failed" });
      return;
    }

    const savedKey = SAVED_ORDER_PREFIX + payment;
    const already  = sessionStorage.getItem(savedKey);
    if (already) { setState(JSON.parse(already)); return; }

    const pending = sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!pending) { setState({ kind: "plain" }); return; }

    // The payment went through, so the cart is spent whatever happens next.
    // Only for cart checkouts: the promo page has no cart, and clearing it
    // would throw away something unrelated the customer had saved.
    if ((JSON.parse(pending) as PendingOrder).endpoint === "/api/orders") clearCart();
    void save(payment);
    // clearCart is stable in intent; this must run exactly once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.kind === "working") {
    return (
      <div className="mt-8">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e5b43d] border-t-transparent" />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Finishing your order…</h1>
        <p className="mt-3 text-gray-600">This only takes a moment. Please keep this page open.</p>
      </div>
    );
  }

  if (state.kind === "offline") {
    return (
      <div className="mt-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Almost done</h1>
        <p className="mt-4 text-lg text-gray-600">
          Your payment went through, but we couldn&apos;t reach our server to finish saving your
          order. Check your internet connection and tap Try again. Please don&apos;t pay a second time.
        </p>
        <button
          type="button"
          onClick={() => {
            const payment = new URLSearchParams(window.location.search).get("payment_intent");
            if (payment) void save(payment);
          }}
          className="mt-8 inline-flex rounded-full bg-[#13294b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1f39]"
        >
          Try again
        </button>
        <p className="mt-6 text-sm text-gray-500">
          Still stuck? Email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-[#13294b] hover:underline">{site.email}</a>
          {" "}and we&apos;ll sort it out.
        </p>
      </div>
    );
  }

  if (state.kind === "payment-failed") {
    return (
      <div className="mt-8">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">!</div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Payment didn&apos;t go through</h1>
        <p className="mt-4 text-lg text-gray-600">
          You have not been charged. Your cart is still saved, so you can try again or use a different payment method.
        </p>
        <Link prefetch={false}
          href="/checkout"
          className="mt-8 inline-flex rounded-full bg-[#13294b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1f39]"
        >
          Back to checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
        ✓
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Order Placed!</h1>

      {state.kind === "saved" && (
        <>
          <p className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-lg font-bold shadow-sm">
            Order {state.orderNumber}
          </p>
          <p className="mt-4 text-lg text-gray-600">
            Thank you! A confirmation is on its way to <span className="font-semibold text-black">{state.email}</span>.
            We&apos;ll email your design proof shortly.
          </p>
        </>
      )}

      {state.kind === "unsaved" && (
        <p className="mt-4 text-lg text-gray-600">
          Your payment went through and our team has your order details. We&apos;ll email you
          your order number and confirmation shortly. If you have questions, email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-[#13294b] hover:underline">{site.email}</a>.
        </p>
      )}

      {state.kind === "plain" && (
        <p className="mt-4 text-lg text-gray-600">
          Thank you for your order. Check your email: we&apos;ll send a confirmation and reach out shortly with your design proof.
        </p>
      )}
    </div>
  );
}
