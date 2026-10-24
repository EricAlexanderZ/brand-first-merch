"use client";

import { useMemo, useState, useEffect, useRef, type HTMLAttributes } from "react";
import { TopBanner, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import CheckoutStep from "@/components/checkout/checkout-step";
import CheckoutSummary from "@/components/checkout/checkout-summary";
import AddressSuggestionModal from "@/components/checkout/address-suggestion-modal";
import StripePaymentForm, { type StripeFormHandle } from "@/components/checkout/stripe-payment-form";
import { useCart } from "@/components/cart/cart-provider";
import { LOCAL_DELIVERY_CITY_LIST } from "@/lib/local-delivery";
import {
  DEFAULT_SHIPPING_FORM,
  US_STATES,
  getShippingLabel,
  hasShippingErrors,
  validateShippingForm,
} from "@/lib/checkout";
import { PENDING_ORDER_KEY, type CheckoutOrderBody, type PendingOrder } from "@/lib/pending-order";
import type {
  DeliveryMethod,
  ShippingFormData,
  ShippingFormErrors,
  SuggestedAddress,
} from "@/types/checkout";

const INPUT = "w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#e5b43d]";

/**
 * One labelled checkout input.
 *
 * Every field carries an id/htmlFor pair and an autoComplete token. Without
 * them phones could not autofill, so customers typed their name, email and
 * address out by hand on a small keyboard.
 */
function Field({
  name,
  label,
  value,
  error,
  onChange,
  autoComplete,
  type = "text",
  inputMode,
  optional = false,
}: {
  name: keyof ShippingFormData;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  autoComplete: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  optional?: boolean;
}) {
  const id = `checkout-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
        {optional && <span className="font-normal text-gray-400"> (optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={INPUT}
      />
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

  const [openStep, setOpenStep] = useState(1);

  useEffect(() => {
    const el = document.getElementById(`checkout-step-${openStep}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }, [openStep]);

  const [shippingComplete, setShippingComplete] = useState(false);
  const [deliveryComplete, setDeliveryComplete] = useState(false);

  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryMethod | null>(null);

  const [shippingForm, setShippingForm] =
    useState<ShippingFormData>(DEFAULT_SHIPPING_FORM);
  const [shippingErrors, setShippingErrors] =
    useState<ShippingFormErrors>({});
  const [shippingError, setShippingError] = useState("");

  const [showAddressSuggestion, setShowAddressSuggestion] = useState(false);
  const [suggestedAddress, setSuggestedAddress] = useState<SuggestedAddress>({
    name: "",
    line1: "",
    line2: "",
    country: "US",
  });

  const stripeFormRef = useRef<StripeFormHandle>(null);
  const [paymentError, setPaymentError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  const shippingPrice = selectedDelivery?.price ?? 0;
  const grandTotal = useMemo(
    () => subtotal + shippingPrice,
    [subtotal, shippingPrice]
  );


  function updateShippingField<K extends keyof ShippingFormData>(
    name: K,
    value: ShippingFormData[K]
  ) {
    setShippingForm((prev) => ({ ...prev, [name]: value }));
  }

  async function validateAddressWithServer() {
    const res = await fetch("/api/address/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: shippingForm.firstName,
        lastName: shippingForm.lastName,
        address1: shippingForm.address1,
        address2: shippingForm.address2,
        city: shippingForm.city,
        state: shippingForm.state,
        zip: shippingForm.zip,
        country: "US",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Address validation failed.");
    }

    return data;
  }

  async function fetchLiveShippingRates() {
    const res = await fetch("/api/shipping/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: shippingForm.firstName,
        lastName: shippingForm.lastName,
        address1: shippingForm.address1,
        address2: shippingForm.address2,
        city: shippingForm.city,
        state: shippingForm.state,
        zip: shippingForm.zip,
        country: "US",
        // The server works out weight, local delivery and the hat offer from
        // the cart, the same way the payment route will when it charges.
        items: items.map((i) => ({ productType: i.productType, quantity: i.quantity })),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Could not load shipping rates.");
    }

    return data.rates as DeliveryMethod[];
  }

  async function completeShippingStep() {
    try {
      setIsLoadingRates(true);
      setShippingError("");

      // Already includes free local delivery and the 25+ hat offer where they
      // apply; see lib/delivery.ts.
      const methods = await fetchLiveShippingRates();
      setDeliveryMethods(methods);

      // Preselect the cheapest option, which is local delivery when it applies.
      // Most customers want it, and an empty choice left "Continue" doing
      // nothing with no explanation.
      setSelectedDelivery(
        methods.length ? methods.reduce((a, b) => (b.price < a.price ? b : a)) : null
      );
      setShippingComplete(true);
      setShowAddressSuggestion(false);
      setOpenStep(2);
    } catch (error) {
      setShippingError(
        error instanceof Error
          ? error.message
          : "Could not load shipping rates."
      );
    } finally {
      setIsLoadingRates(false);
    }
  }

  async function saveShipping() {
    const errors = validateShippingForm(shippingForm);
    setShippingErrors(errors);
    setShippingError("");

    if (hasShippingErrors(errors)) return;

    try {
      const validated = await validateAddressWithServer();
      setSuggestedAddress(validated.suggested);
      setShowAddressSuggestion(true);
    } catch {
      await completeShippingStep();
    }
  }

  function saveDelivery() {
    if (!selectedDelivery) return;
    setDeliveryComplete(true);
    setOpenStep(3);
  }

  async function handlePlaceOrder() {
    try {
      setPaymentError("");
      setIsPlacingOrder(true);

      if (grandTotal <= 0) throw new Error("Invalid order total.");
      if (!stripeFormRef.current) throw new Error("Payment form not ready.");

      await stripeFormRef.current.validate();

      // The server prices the order itself; nothing here says what to charge.
      const intentRes = await fetch("/api/payments/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address: {
            name:  `${shippingForm.firstName} ${shippingForm.lastName}`.trim(),
            line1: shippingForm.address1,
            line2: shippingForm.address2 || undefined,
            city:  shippingForm.city,
            state: shippingForm.state,
            zip:   shippingForm.zip,
          },
          deliveryLabel: selectedDelivery?.label ?? "",
        }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData?.error || "Payment failed.");

      // The page and the server use the same pricing, so these agree. If they
      // ever do not (a price changed mid-checkout), stop rather than charge an
      // amount the customer was not shown.
      if (Math.round(intentData.total * 100) !== Math.round(grandTotal * 100)) {
        throw new Error(
          `Your total has been updated to $${Number(intentData.total).toFixed(2)}. ` +
          "Please refresh the page to review it before placing your order."
        );
      }

      /*
       * The order is saved by the confirmation page, not here. Some payment
       * methods (Klarna, some banks) leave the site to approve the payment and
       * come back to /order-confirmation, so code after confirmPayment never
       * runs for them, and those orders used to be paid for and never saved.
       * Parking the order first gives both paths one place to finish.
       */
      const order: CheckoutOrderBody = {
        customerName:  `${shippingForm.firstName} ${shippingForm.lastName}`.trim(),
        customerEmail: shippingForm.email.trim(),
        customerPhone: shippingForm.phone,
        shippingAddress: {
          line1: shippingForm.address1,
          line2: shippingForm.address2 || undefined,
          city:  shippingForm.city,
          state: shippingForm.state,
          zip:   shippingForm.zip,
        },
        shippingMethod: selectedDelivery?.label ?? "",
        shippingPrice,
        subtotal,
        total: grandTotal,
        items,
      };
      const pending: PendingOrder = {
        endpoint: "/api/orders",
        customerEmail: order.customerEmail,
        body: order,
      };
      sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pending));

      const paymentIntentId = await stripeFormRef.current.confirmPayment(intentData.clientSecret);

      window.location.href =
        `/order-confirmation?payment_intent=${encodeURIComponent(paymentIntentId)}&redirect_status=succeeded`;
    } catch (error) {
      sessionStorage.removeItem(PENDING_ORDER_KEY);
      setPaymentError(
        error instanceof Error ? error.message : "Payment failed."
      );
      setIsPlacingOrder(false);
    }
  }

  function handleUseSuggestedAddress() {
    setShippingForm((prev) => ({
      ...prev,
      address1: suggestedAddress.line1,
      city: prev.city.toUpperCase(),
      state: prev.state.toUpperCase(),
      zip: prev.zip,
    }));

    void completeShippingStep();
  }

  const field = (name: keyof ShippingFormData) => ({
    name,
    value: String(shippingForm[name]),
    error: shippingErrors[name],
    onChange: (v: string) => updateShippingField(name, v),
  });

  const shippingSummary = [
    `${shippingForm.firstName} ${shippingForm.lastName}`.trim(),
    shippingForm.address1,
    `${shippingForm.city}, ${shippingForm.state} ${shippingForm.zip}`,
  ].filter(Boolean).join(" · ");

  return (
    <main className="min-h-dvh bg-[#f6f6f4] text-black">
      <TopBanner />
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-5xl">
          Checkout
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <CheckoutStep
              id="checkout-step-1"
              stepNumber={1}
              title="Contact & Shipping"
              summary={shippingSummary}
              isOpen={openStep === 1}
              isComplete={shippingComplete}
              onToggle={() => setOpenStep(openStep === 1 ? 0 : 1)}
            >
              <form
                className="space-y-6"
                autoComplete="on"
                onSubmit={(e) => { e.preventDefault(); void saveShipping(); }}
              >
                <Field {...field("email")} label="Email" type="email" inputMode="email" autoComplete="email" />

                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={shippingForm.subscribe}
                    onChange={(e) =>
                      updateShippingField("subscribe", e.target.checked)
                    }
                  />
                  Subscribe to our deals and reorder emails
                </label>

                <h2 className="text-2xl font-bold">Shipping Address</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field {...field("firstName")} label="First Name" autoComplete="shipping given-name" />
                  <Field {...field("lastName")} label="Last Name" autoComplete="shipping family-name" />
                  <Field {...field("phone")} label="Phone" type="tel" inputMode="tel" autoComplete="shipping tel" />
                  <Field {...field("company")} label="Company" optional autoComplete="shipping organization" />
                </div>

                <Field {...field("address1")} label="Street Address" autoComplete="shipping address-line1" />
                <Field {...field("address2")} label="Apt, suite, unit" optional autoComplete="shipping address-line2" />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field {...field("city")} label="City" autoComplete="shipping address-level2" />

                  <div>
                    <label htmlFor="checkout-state" className="mb-2 block text-sm font-semibold">
                      State
                    </label>
                    <select
                      id="checkout-state"
                      name="state"
                      autoComplete="shipping address-level1"
                      value={shippingForm.state}
                      onChange={(e) => updateShippingField("state", e.target.value)}
                      aria-invalid={!!shippingErrors.state}
                      className={INPUT}
                    >
                      <option value="">Select…</option>
                      {US_STATES.map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                    {shippingErrors.state ? (
                      <p className="mt-2 text-sm text-red-500">{shippingErrors.state}</p>
                    ) : null}
                  </div>

                  <Field {...field("zip")} label="Zip Code" inputMode="numeric" autoComplete="shipping postal-code" />
                </div>

                {shippingError ? (
                  <p className="text-sm text-red-500">{shippingError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoadingRates}
                  className="w-full rounded-xl bg-[#e5b43d] px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isLoadingRates
                    ? "Loading delivery options..."
                    : "Continue to Delivery"}
                </button>
              </form>
            </CheckoutStep>

            <CheckoutStep
              id="checkout-step-2"
              stepNumber={2}
              title="Delivery Method"
              summary={getShippingLabel(selectedDelivery)}
              isOpen={openStep === 2}
              isComplete={deliveryComplete}
              isLocked={!shippingComplete}
              onToggle={() =>
                shippingComplete && setOpenStep(openStep === 2 ? 0 : 2)
              }
            >
              {/*
                Shown whether or not the address qualified. If it did, this explains
                why the free option is there; if it did not, it tells the customer the
                service exists rather than leaving them wondering why they are being
                quoted a carrier rate.
              */}
              <div className="mb-4 rounded-xl border border-[#e5b43d]/40 bg-[#fff8e7] px-4 py-3">
                <p className="text-sm font-semibold text-[#13294b]">Free local delivery</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  We deliver to {LOCAL_DELIVERY_CITY_LIST} at no charge. Choose it below if
                  your address is in one of those cities.
                </p>
              </div>

              <div className="space-y-3">
                {deliveryMethods.length === 0 && (
                  <p className="text-sm text-gray-600">
                    We couldn&apos;t find delivery options for this address. Check it in step 1,
                    or contact us and we&apos;ll arrange delivery.
                  </p>
                )}

                {deliveryMethods.map((method) => {
                  const selected = selectedDelivery?.id === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedDelivery(method)}
                      aria-pressed={selected}
                      className={`block w-full rounded-xl border px-4 py-4 text-left transition ${
                        selected
                          ? "border-[#e5b43d] bg-[#fff8e7]"
                          : "border-black/10 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{method.label}</span>
                        <span className="font-semibold">
                          {method.price === 0
                            ? "Free"
                            : `$${method.price.toFixed(2)}`}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">{method.eta}</p>
                    </button>
                  );
                })}

                <p className="pt-2 text-sm text-gray-500">
                  Delivery dates assume approval within 30 hours. We are closed over the weekends.
                </p>

                <button
                  type="button"
                  onClick={saveDelivery}
                  disabled={!selectedDelivery}
                  className="w-full rounded-xl bg-[#e5b43d] px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Continue to Payment
                </button>
              </div>
            </CheckoutStep>

            <CheckoutStep
              id="checkout-step-3"
              stepNumber={3}
              title="Payment & Place Order"
              isOpen={openStep === 3}
              isLocked={!deliveryComplete}
              keepMounted
              onToggle={() =>
                deliveryComplete && setOpenStep(openStep === 3 ? 0 : 3)
              }
            >
              <StripePaymentForm ref={stripeFormRef} amount={grandTotal} />
              <p className="mt-3 text-sm text-gray-500">
                Your payment is securely processed by Stripe. We do not store your card information.
              </p>

              {/* What is being bought, right next to the button that buys it. */}
              <div className="mt-6 rounded-[1.25rem] border border-black/10 p-4">
                <p className="text-sm font-bold">Your order</p>
                <div className="mt-3 space-y-2 text-sm">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="flex justify-between gap-4">
                      <span className="text-gray-700">
                        {item.productType}
                        {item.color ? ` · ${item.color}` : ""} × {item.quantity}
                      </span>
                      <span className="shrink-0 font-semibold">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 text-gray-600">
                    <span>{selectedDelivery?.label ?? "Shipping"}</span>
                    <span className="shrink-0">{shippingPrice === 0 ? "Free" : `$${shippingPrice.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-black/10 pt-2 text-base font-bold">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 rounded-[1.25rem] bg-[#f9f6ee] px-4 py-4 text-sm text-gray-700">
                <p><span className="text-[#e5b43d]">✓</span> We email you a proof. Nothing is made until you approve it.</p>
                <p><span className="text-[#e5b43d]">✓</span> Request changes or cancel any time before approving.</p>
                <p><span className="text-amber-500">⚠</span> No response within 5 days? Your proof auto-approves so your timeline stays on track.</p>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="mt-6 w-full rounded-xl bg-[#e5b43d] px-8 py-4 text-base font-bold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPlacingOrder ? "Processing..." : `Place Order · $${grandTotal.toFixed(2)}`}
              </button>

              {paymentError && (
                <p className="mt-4 text-sm text-red-500">{paymentError}</p>
              )}

              <p className="mt-4 text-center text-xs text-gray-400">
                By clicking &quot;Place Order&quot;, you agree to our{" "}
                <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>{" "}and{" "}
                <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
              </p>
            </CheckoutStep>
          </div>

          <CheckoutSummary
            shippingLabel={getShippingLabel(selectedDelivery)}
            shippingPrice={shippingPrice}
          />
        </div>
      </section>

      <AddressSuggestionModal
        isOpen={showAddressSuggestion}
        onClose={() => setShowAddressSuggestion(false)}
        onUseOriginal={completeShippingStep}
        onUseSuggested={handleUseSuggestedAddress}
        original={{
          name: `${shippingForm.firstName} ${shippingForm.lastName}`.trim(),
          line1: shippingForm.address1,
          line2: `${shippingForm.city}, ${shippingForm.state} ${shippingForm.zip}`,
          country: "US",
        }}
        suggested={suggestedAddress}
      />

      <SiteFooter />
    </main>
  );
}
