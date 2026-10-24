"use client";

import Link from "next/link";
import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProcessSteps } from "@/components/process-steps";
import { useCart } from "@/components/cart/cart-provider";
import CartItemCard from "@/components/cart/cart-item-card";
import OrderSummaryCard from "@/components/cart/order-summary-card";
import AddMoreCategories from "@/components/cart/add-more-categories";

export default function CartPage() {
  const { items } = useCart();

  return (
    <main className="min-h-dvh bg-[#f6f6f4] text-black">
      <TopBanner />
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-5xl">
          My Cart
        </h1>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {items.length === 0 ? (
              <div className="rounded-[1.75rem] bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-semibold">Your cart is empty.</p>
                <Link prefetch={false}
                  href="/#categories"
                  className="mt-5 inline-flex rounded-full bg-[#13294b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1f39]"
                >
                  Start shopping
                </Link>
              </div>
            ) : (
              items.map((item) => <CartItemCard key={item.cartItemId} item={item} />)
            )}
          </div>

          <div className="space-y-4">
            <OrderSummaryCard />
          </div>
        </div>

        <AddMoreCategories />
      </section>

      <ProcessSteps />
      <SiteFooter />
    </main>
  );
}