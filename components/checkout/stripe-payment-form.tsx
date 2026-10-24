"use client";

import { forwardRef, useImperativeHandle } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";

export type StripeFormHandle = {
  /** Checks the entered details. Throws with Stripe's message if incomplete. */
  validate: () => Promise<void>;
  /**
   * Charges the customer. Resolves with the PaymentIntent id when the payment
   * completed in place. Methods that need a bank or Klarna page navigate away
   * to /order-confirmation instead, and this never resolves.
   */
  confirmPayment: (clientSecret: string) => Promise<string>;
};

const StripeInner = forwardRef<StripeFormHandle>(function StripeInner(_props, ref) {
  const stripe = useStripe();
  const elements = useElements();

  useImperativeHandle(ref, () => ({
    async validate() {
      if (!stripe || !elements) throw new Error("Payment form is still loading. Try again in a moment.");
      const { error } = await elements.submit();
      if (error) throw new Error(error.message ?? "Please check your payment details.");
    },
    async confirmPayment(clientSecret: string) {
      if (!stripe || !elements) throw new Error("Stripe not ready.");
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: "if_required",
      });
      if (error) throw new Error(error.message);
      return paymentIntent.id;
    },
  }));

  return (
    <PaymentElement
      options={{
        layout: "tabs",
        // Show Card first, then wallets (Apple/Google Pay) when the device
        // supports them, ahead of bank/Klarna.
        paymentMethodOrder: ["card", "apple_pay", "google_pay", "klarna", "us_bank_account"],
        wallets: { applePay: "auto", googlePay: "auto" },
      }}
    />
  );
});

type Props = {
  amount: number;
};

const StripePaymentForm = forwardRef<StripeFormHandle, Props>(function StripePaymentForm({ amount }, ref) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        currency: "usd",
        amount: Math.round(amount * 100),
        appearance: {
          theme: "flat",
          variables: {
            borderRadius: "12px",
            colorPrimary: "#e5b43d",
            colorBackground: "#ffffff",
            colorText: "#0a0a0a",
            colorDanger: "#ef4444",
            fontFamily: "inherit",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "none",
              padding: "12px 16px",
            },
            ".Input:focus": {
              border: "1px solid #e5b43d",
              boxShadow: "0 0 0 3px rgba(229,180,61,0.15)",
              outline: "none",
            },
            ".Label": {
              fontWeight: "600",
              marginBottom: "6px",
            },
            ".Tab": {
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "12px",
              color: "#0a0a0a",
            },
            ".TabIcon": {
              fill: "#13294b",
            },
            ".TabLabel": {
              color: "#0a0a0a",
            },
            ".Tab--selected": {
              border: "1px solid #e5b43d",
              backgroundColor: "#fff8e7",
              color: "#13294b",
            },
            ".Tab--selected:focus": {
              border: "1px solid #e5b43d",
              backgroundColor: "#fff8e7",
              boxShadow: "0 0 0 3px rgba(229,180,61,0.15)",
            },
            ".TabIcon--selected": {
              fill: "#13294b",
            },
            ".TabLabel--selected": {
              color: "#13294b",
            },
          },
        },
      }}
    >
      <StripeInner ref={ref} />
    </Elements>
  );
});

export default StripePaymentForm;
