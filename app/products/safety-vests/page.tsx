"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProcessSteps } from "@/components/process-steps";
import {
  Label,
  QuantitySelector,
  PriceSummary,
  SizeBreakdown,
  sizeBreakdownTotal,
  sizeBreakdownIsValid,
  type QuantityOption,
} from "@/components/products/product-ui";
import { getUnitPrice } from "@/lib/products/pricing";

/*
 * Hi-vis safety vests, flat $18 each.
 *
 * No tier table: the price does not move with quantity, so the presets below
 * all resolve to the same per-piece rate and there is nothing to discount.
 * If tiers arrive later they go in lib/products/pricing.ts and this page picks
 * them up without edits, because the presets are computed from getUnitPrice
 * rather than written out.
 */

const PRODUCT_TYPE = "Safety Vests";
const STYLE = "ANSI hi-vis mesh safety vest";

const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
const QUANTITY_PRESETS = [1, 5, 10, 25, 50];

const PLACEMENTS = [
  { id: "Left Chest Logo", label: "Left chest logo", note: "Small mark on the front panel" },
  { id: "Back Logo", label: "Back logo", note: "Large mark across the back" },
];

const VIEWS = [
  { id: "front", src: "/images/products/safety-vest-front.webp", label: "Front" },
  { id: "back", src: "/images/products/safety-vest-back.webp", label: "Back" },
];

export default function SafetyVestsPage() {
  const router = useRouter();

  const [selectedQuantity, setSelectedQuantity] = useState("10 Vests");
  const [isCustomQuantity, setIsCustomQuantity] = useState(false);
  const [customQuantity, setCustomQuantity] = useState("");
  const [customQuantityError, setCustomQuantityError] = useState("");
  const [sizeBreakdown, setSizeBreakdown] = useState<Record<string, number>>({});
  const [placements, setPlacements] = useState<string[]>(["Back Logo"]);
  const [view, setView] = useState(1);

  const quantities: QuantityOption[] = useMemo(
    () =>
      QUANTITY_PRESETS.map((qty) => ({
        label: `${qty} Vest${qty === 1 ? "" : "s"}`,
        qty,
        price: qty * getUnitPrice(PRODUCT_TYPE, qty),
      })),
    []
  );

  const parsedCustomQty = Number.parseInt(customQuantity, 10);
  const customQtyIsValid = Number.isFinite(parsedCustomQty) && parsedCustomQty >= 1;

  const qty = isCustomQuantity
    ? customQtyIsValid
      ? parsedCustomQty
      : 0
    : quantities.find((q) => q.label === selectedQuantity)?.qty ?? 0;

  const perUnit = qty > 0 ? getUnitPrice(PRODUCT_TYPE, qty) : 0;
  const total = perUnit * qty;

  const sizesTotal = sizeBreakdownTotal(SIZES, sizeBreakdown);
  // A breakdown that contradicts the order is worse than none: the shop would
  // receive two different quantities with no way to tell which was meant.
  const isValid = qty > 0 && placements.length > 0 && sizeBreakdownIsValid(sizesTotal, qty);

  function togglePlacement(id: string) {
    setPlacements((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleCustomChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value !== "" && !/^\d+$/.test(value)) return;
    setIsCustomQuantity(true);
    const n = Number.parseInt(value, 10);
    setCustomQuantity(value);
    setCustomQuantityError(n < 1 ? "Enter a quantity of 1 or more." : "");
  }

  function handleCustomFocus() {
    setIsCustomQuantity(true);
    if (!customQuantity) setCustomQuantityError("Please enter a quantity.");
  }

  const sizeSummary = SIZES.filter((s) => (sizeBreakdown[s] || 0) > 0)
    .map((s) => `${s}×${sizeBreakdown[s]}`)
    .join(", ");

  function goToUpload() {
    sessionStorage.setItem("cartItemImage", VIEWS[view].src);
    const params = new URLSearchParams({
      productType: PRODUCT_TYPE,
      style: STYLE,
      color: "Hi-vis yellow",
      quantity: isCustomQuantity && customQtyIsValid ? String(parsedCustomQty) : selectedQuantity,
      placement: placements.join(", "),
      ...(sizeSummary ? { sizes: sizeSummary } : {}),
      total: String(total),
      perUnit: String(perUnit),
      minQty: "1",
      flatUpcharge: "0",
      perPieceUpcharge: "0",
    });
    router.push(`/upload-artwork?${params.toString()}`);
  }

  const summaryItems = [
    { label: "Style", value: STYLE },
    { label: "Colour", value: "Hi-vis yellow" },
    { label: "Placement", value: placements.join(", ") || "None selected" },
    { label: "Sizes", value: sizeSummary || "Not specified" },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <TopBanner />
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-14 pb-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Safety Vests</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
          Hi-vis mesh vests with your logo, $18 each at any quantity. Job site
          ready, and the crew is recognisable from across the lot.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 lg:grid-cols-3">
        {/* Col 1 — Placement + sizes */}
        <div>
          <Label>Logo placement</Label>
          <div className="grid gap-2">
            {PLACEMENTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlacement(p.id)}
                aria-pressed={placements.includes(p.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  placements.includes(p.id)
                    ? "border-[#e3b33d] bg-[#fff8e7]"
                    : "border-black/10 bg-white hover:border-[#d9d9d9]"
                }`}
              >
                <span className="text-sm font-semibold">{p.label}</span>
                {placements.includes(p.id) && (
                  <span className="ml-2 text-xs text-[#d39a14]">★ Selected</span>
                )}
                <span className="mt-1 block text-xs text-gray-500">{p.note}</span>
              </button>
            ))}
          </div>
          {placements.length === 0 && (
            <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
              Pick at least one placement.
            </p>
          )}

          <div className="mt-8">
            <SizeBreakdown
              sizes={SIZES}
              breakdown={sizeBreakdown}
              orderQty={qty}
              unit="vest"
              onChange={setSizeBreakdown}
            />
          </div>
        </div>

        {/* Col 2 — Preview */}
        <div>
          <div className="rounded-[1.75rem] border border-black/10 bg-[#f6f7f9] p-6">
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <Image
                src={VIEWS[view].src}
                alt={`Hi-vis safety vest, ${VIEWS[view].label.toLowerCase()}`}
                fill
                sizes="(min-width: 1024px) 380px, 90vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {VIEWS.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(i)}
                  aria-pressed={view === i}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    view === i
                      ? "border-[#13294b] bg-white text-[#13294b]"
                      : "border-transparent bg-white/60 text-gray-500 hover:bg-white"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
              Shown with a customer&apos;s logo. Yours goes in the same positions.
            </p>
          </div>
        </div>

        {/* Col 3 — Quantity + price */}
        <div>
          <Label>Quantity</Label>
          <QuantitySelector
            quantities={quantities}
            selectedQuantity={selectedQuantity}
            isCustomQuantity={isCustomQuantity}
            customQuantity={customQuantity}
            customQuantityError={customQuantityError}
            customQtyIsValid={customQtyIsValid}
            total={total}
            perUnit={perUnit}
            onPresetSelect={(label) => {
              setSelectedQuantity(label);
              setIsCustomQuantity(false);
              setCustomQuantityError("");
            }}
            onCustomChange={handleCustomChange}
            onCustomFocus={handleCustomFocus}
          />

          <div className="mt-6">
            <PriceSummary
              total={total}
              perUnit={perUnit}
              unit="vest"
              isValid={isValid}
              onSubmit={goToUpload}
              summaryItems={summaryItems}
            />
          </div>
        </div>
      </section>

      <ProcessSteps />
      <SiteFooter />
    </div>
  );
}
