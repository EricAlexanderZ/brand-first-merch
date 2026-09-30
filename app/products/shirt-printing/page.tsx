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
  type QuantityOption,
} from "@/components/products/product-ui";
import {
  getUnitPrice,
  shirtPrintingType,
  SHIRT_FABRICS,
  SHIRT_SLEEVES,
  type ShirtFabric,
  type ShirtSleeve,
} from "@/lib/products/pricing";

/*
 * DTF shirt printing.
 *
 * Deliberately shaped differently from the embroidery pages. Two things drive
 * the price here, fabric and sleeve length, and nothing else: the quoted rate
 * already covers a front AND a back print, so there is no placement upcharge
 * to add and no placement selector to offer. Presenting one would imply a
 * choice that does not change the price.
 *
 * There is no colour picker either, because there is no colour photography for
 * printed blanks yet. Rather than invent swatches, the page says colour is
 * settled on the proof. Add real garment photos and a picker can follow.
 */

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const QUANTITY_PRESETS = [1, 11, 30, 50, 101];

const FABRIC_BLURB: Record<ShirtFabric, string> = {
  "Dri-Fit": "Moisture-wicking polyester. Holds colour, dries fast, best for teams, outdoor work and anything active.",
  Cotton: "Gildan cotton. Softer hand, heavier feel, the everyday tee. Two dollars less per piece at every quantity.",
};

export default function ShirtPrintingPage() {
  const router = useRouter();

  const [fabric, setFabric] = useState<ShirtFabric>("Dri-Fit");
  const [sleeve, setSleeve] = useState<ShirtSleeve>("Short Sleeve");
  const [view, setView] = useState<"front" | "back">("front");

  const [selectedQuantity, setSelectedQuantity] = useState("11 Shirts");
  const [isCustomQuantity, setIsCustomQuantity] = useState(false);
  const [customQuantity, setCustomQuantity] = useState("");
  const [customQuantityError, setCustomQuantityError] = useState("");
  const [sizeBreakdown, setSizeBreakdown] = useState<Record<string, number>>({});

  const productType = shirtPrintingType(fabric, sleeve);

  // Preset prices are computed from the tier table, never written out: a
  // hardcoded label goes stale the moment a price changes and then advertises
  // a number the cart will not honour.
  const quantities: QuantityOption[] = useMemo(
    () =>
      QUANTITY_PRESETS.map((qty) => ({
        label: `${qty} Shirt${qty === 1 ? "" : "s"}`,
        qty,
        price: qty * getUnitPrice(productType, qty),
      })),
    [productType]
  );

  const parsedCustomQty = Number.parseInt(customQuantity, 10);
  const customQtyIsValid = Number.isFinite(parsedCustomQty) && parsedCustomQty >= 1;

  const qty = isCustomQuantity
    ? customQtyIsValid
      ? parsedCustomQty
      : 0
    : quantities.find((q) => q.label === selectedQuantity)?.qty ?? 0;

  const perUnit = qty > 0 ? getUnitPrice(productType, qty) : 0;
  const total = perUnit * qty;
  const isValid = qty > 0;

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

  function setSize(size: string, value: string) {
    const n = Number.parseInt(value, 10);
    setSizeBreakdown((prev) => ({ ...prev, [size]: Number.isFinite(n) && n > 0 ? n : 0 }));
  }

  const sizeSummary = SIZES.filter((s) => (sizeBreakdown[s] || 0) > 0)
    .map((s) => `${s}×${sizeBreakdown[s]}`)
    .join(", ");

  const image =
    view === "front"
      ? "/images/products/shirt-printing-front.webp"
      : "/images/products/shirt-printing-back.webp";

  function goToUpload() {
    sessionStorage.setItem("cartItemImage", image);
    const params = new URLSearchParams({
      productType,
      style: `${fabric} ${sleeve}`,
      color: "Confirmed on proof",
      quantity: isCustomQuantity && customQtyIsValid ? String(parsedCustomQty) : selectedQuantity,
      // Front and back are included in the rate, so this records what is being
      // made rather than offering a choice that changes nothing.
      placement: "Front and Back Print",
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
    { label: "Fabric", value: fabric },
    { label: "Sleeve", value: sleeve },
    { label: "Printing", value: "Front and back included" },
    { label: "Sizes", value: sizeSummary || "Not specified" },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <TopBanner />
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-14 pb-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Shirt Printing</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
          DTF printing on dri-fit and cotton tees. Full colour, no setup fees, and
          every price below already includes a front <em>and</em> a back print.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 lg:grid-cols-3">
        {/* Col 1 — Fabric + sleeve */}
        <div>
          <Label>Fabric</Label>
          <div className="mb-2 grid gap-2">
            {SHIRT_FABRICS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFabric(f)}
                aria-pressed={fabric === f}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  fabric === f
                    ? "border-[#e3b33d] bg-[#fff8e7]"
                    : "border-black/10 bg-white hover:border-[#d9d9d9]"
                }`}
              >
                <span className="text-sm font-semibold">{f}</span>
                {fabric === f && <span className="ml-2 text-xs text-[#d39a14]">★ Selected</span>}
                <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                  {FABRIC_BLURB[f]}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <Label>Sleeve</Label>
            <div className="grid grid-cols-2 gap-2">
              {SHIRT_SLEEVES.map((sl) => (
                <button
                  key={sl}
                  type="button"
                  onClick={() => setSleeve(sl)}
                  aria-pressed={sleeve === sl}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    sleeve === sl
                      ? "border-[#e3b33d] bg-[#fff8e7]"
                      : "border-black/10 bg-white hover:border-[#d9d9d9]"
                  }`}
                >
                  {sl}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Label>Sizes</Label>
            <p className="mb-3 text-xs text-gray-500">
              Optional. Tell us the split now or send it with your artwork.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {SIZES.map((s) => (
                <label key={s} className="text-center">
                  <span className="mb-1 block text-xs font-bold text-gray-500">{s}</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={sizeBreakdown[s] || ""}
                    onChange={(e) => setSize(s, e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-black/10 px-2 py-2 text-center text-sm outline-none focus:border-[#13294b]"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2 — Preview */}
        <div>
          <div className="rounded-[1.75rem] border border-black/10 bg-[#f6f7f9] p-6">
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <Image
                src={image}
                alt={`DTF printed shirt, ${view}`}
                fill
                sizes="(min-width: 1024px) 380px, 90vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["front", "back"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                    view === v
                      ? "border-[#13294b] bg-white text-[#13294b]"
                      : "border-transparent bg-white/60 text-gray-500 hover:bg-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
              Real customer work. Garment colour is settled on your proof before
              anything is printed.
            </p>
          </div>

          <ul className="mt-6 grid gap-3">
            {[
              ["Front and back included", "Both prints are in the price. No per-placement upcharge."],
              ["Full colour, no setup fee", "DTF handles photographic and many-colour artwork that embroidery cannot."],
              ["No minimum order", "One shirt or a thousand. The per-piece price falls as quantity rises."],
            ].map(([title, body]) => (
              <li key={title} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{body}</p>
              </li>
            ))}
          </ul>
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
              unit="shirt"
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
