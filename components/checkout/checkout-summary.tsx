"use client";

import { useCart } from "@/components/cart/cart-provider";

type CheckoutSummaryProps = {
  shippingLabel?: string;
  shippingPrice?: number;
};

export default function CheckoutSummary({
  shippingLabel = "Select method",
  shippingPrice = 0,
}: CheckoutSummaryProps) {
  const { items, subtotal } = useCart();
  const total = subtotal + shippingPrice;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] bg-white shadow-sm">
        <div className="border-b border-black/10 px-5 py-5">
          <h3 className="text-2xl font-bold sm:text-3xl">In Your Cart</h3>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.productType}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-5">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping:</span>
              <span>{shippingPrice === 0 ? shippingLabel : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Taxes:</span>
              <span>$0.00</span>
            </div>
          </div>

          <div className="mt-5 border-t border-black/10 pt-4">
            <div className="flex items-center justify-between text-2xl font-bold sm:text-3xl">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
