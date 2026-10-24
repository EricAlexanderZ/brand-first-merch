"use client";

import Image from "next/image";
import type { CartItem } from "@/types/cart";
import { useCart } from "@/components/cart/cart-provider";

const PRODUCT_EMOJI: Record<string, string> = {
  "Custom Hats":     "🧢",
  "Custom Polos":    "👔",
  "Custom Hoodies":  "🧥",
  "Custom Sweaters": "🧶",
};

export default function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const emoji = item.image ?? PRODUCT_EMOJI[item.productType] ?? "📦";
  const artworkCount = (item.artworkUrls ?? []).filter(Boolean).length;
  const hasArtwork   = artworkCount > 0;

  return (
    <div className="rounded-[1.75rem] bg-white p-4 shadow-sm sm:p-6">
      {/* Top row: thumbnail + name + remove */}
      <div className="flex items-start gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-24 sm:w-24">
          {emoji.startsWith("/") || emoji.startsWith("http") ? (
            <Image src={emoji} alt={item.productType} fill sizes="96px" className="object-contain p-1" />
          ) : (
            <span className="text-4xl sm:text-5xl">{emoji}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold leading-tight sm:text-2xl">{item.productType}</h3>
            <button
              type="button"
              onClick={() => removeItem(item.cartItemId)}
              className="shrink-0 text-sm text-gray-400 hover:text-red-500"
            >
              Remove
            </button>
          </div>

          <div className="mt-1 space-y-0.5 text-sm text-gray-600">
            {item.style    && <p>{item.style}</p>}
            {item.color    && <p>{item.color}</p>}
            {item.placement.length > 0 && <p>{item.placement.join(", ")}</p>}
            {Object.entries(item.details)
              .filter(([, v]) => !v.startsWith("/") && !v.startsWith("http"))
              .map(([k, v]) => (
                <p key={k}><span className="font-medium">{k}:</span> {v}</p>
              ))}
            {item.flatUpcharge > 0 && (
              <p className="text-[#d39a14]">+${item.flatUpcharge.toFixed(2)} placement upcharge</p>
            )}
          </div>
        </div>
      </div>

      <p className={`mt-3 text-sm ${hasArtwork ? "text-green-700" : "text-gray-500"}`}>
        {hasArtwork
          ? `✓ Artwork uploaded${artworkCount > 1 ? ` (${artworkCount} files)` : ""}`
          : "No artwork yet. We'll ask for it with your proof."}
      </p>

      {/* Bottom row: quantity + price */}
      <div className="mt-4 flex items-end justify-between gap-4">
        {item.details.Sizes ? (
          // Quantity is the sum of the sizes, so it is not editable here.
          <div>
            <p className="text-sm font-semibold">Qty {item.quantity}</p>
            <p className="mt-1 max-w-[12rem] text-xs text-gray-500">
              Set by your sizes. To change it, remove this item and add it again.
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500" htmlFor={`qty-${item.cartItemId}`}>
              Quantity
            </label>
            <input
              id={`qty-${item.cartItemId}`}
              type="number"
              inputMode="numeric"
              min={item.minQty}
              step={1}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.cartItemId, Number(e.target.value))}
              className="w-20 rounded-xl border border-black/10 px-3 py-2 text-sm sm:w-24"
            />
            {item.minQty > 1 && (
              <p className="mt-1 text-xs text-gray-500">Min: {item.minQty}</p>
            )}
          </div>
        )}

        <div className="text-right">
          <p className="text-xl font-bold">${item.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500">${item.unitPrice.toFixed(2)} / piece</p>
        </div>
      </div>
    </div>
  );
}
