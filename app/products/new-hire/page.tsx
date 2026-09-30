"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProcessSteps } from "@/components/process-steps";
import { Label, PriceSummary } from "@/components/products/product-ui";
import { POLO_STYLE, POLO_COLORS, POLO_SIZES } from "@/lib/products/polos";
import { SOLIDS as CAP_COLORS } from "@/lib/products/caps";

/*
 * The New Hire — a fixed-price onboarding bundle.
 *
 * Unlike every other product page, this one does not quote from a tier table.
 * It is a flat $115 for a fixed set of items, so there is no quantity control
 * and no per-piece maths: the price is the price.
 *
 * The four artwork slots come free. /upload-artwork already renders one
 * uploader per comma-separated entry in `placement`, so passing the four items
 * gives the customer a separate upload for each without a parallel flow to
 * build or maintain.
 */

const PRICE = 115;

const CONTENTS = [
  { qty: 3, name: "Embroidered polos", note: "Your colour and sizes, left chest logo" },
  { qty: 1, name: "Embroidered cap", note: "Flex Fit 110, your colour" },
  { qty: 1, name: "Safety vest", note: "Hi-vis yellow, logo front and back" },
  { qty: 3, name: "Hardhat stickers", note: "Die-cut to your artwork" },
];

/** One upload slot each. The order here is the order they appear on upload. */
const ARTWORK_SLOTS = [
  "Polo Logo",
  "Cap Logo",
  "Safety Vest Logo",
  "Hardhat Stickers",
];

const VEST_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

const GALLERY = [
  { src: "/images/products/polo-mens-bf.webp", alt: "Embroidered polo" },
  { src: "/images/products/cap-110-b2z.webp", alt: "Embroidered Flex Fit 110 cap" },
  { src: "/images/products/safety-vest-front.webp", alt: "Hi-vis safety vest, front" },
  { src: "/images/products/safety-vest-back.webp", alt: "Hi-vis safety vest, back" },
];

export default function NewHirePage() {
  const router = useRouter();

  const [poloColor, setPoloColor] = useState("Black");
  const [capColor, setCapColor] = useState("Black");
  const [vestSize, setVestSize] = useState("L");
  const [poloSizes, setPoloSizes] = useState<string[]>(["L", "L", "L"]);
  const [view, setView] = useState(0);

  const currentPolo = POLO_COLORS.find((c) => c.name === poloColor) ?? POLO_COLORS[0];

  function setPoloSize(index: number, size: string) {
    setPoloSizes((prev) => prev.map((s, i) => (i === index ? size : s)));
  }

  function goToUpload() {
    sessionStorage.setItem("cartItemImage", currentPolo.front);
    const params = new URLSearchParams({
      productType: "The New Hire",
      style: "Onboarding bundle: 3 polos, 1 cap, 1 safety vest, 3 hardhat stickers",
      color: `Polos ${poloColor}, cap ${capColor}`,
      quantity: "1",
      // Drives the four upload slots on the next screen.
      placement: ARTWORK_SLOTS.join(", "),
      poloSizes: poloSizes.join(", "),
      vestSize,
      total: String(PRICE),
      perUnit: String(PRICE),
      minQty: "1",
      flatUpcharge: "0",
      perPieceUpcharge: "0",
    });
    router.push(`/upload-artwork?${params.toString()}`);
  }

  const summaryItems = [
    { label: "Polos", value: `3 × ${poloColor} (${poloSizes.join(", ")})` },
    { label: "Cap", value: `1 × ${capColor}` },
    { label: "Safety vest", value: `1 × Hi-vis yellow, size ${vestSize}` },
    { label: "Hardhat stickers", value: "3 × die-cut" },
    { label: "Artwork", value: "Uploaded on the next step" },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <TopBanner />
      <SiteHeader />

      <section className="border-b border-black/5 bg-shell">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold-deep">
            For companies
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            The New Hire
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
            Kit out your new employee on day one for $115. Three polos, a cap, a
            safety vest and their hardhat stickers, all branded, all ready before
            they walk in.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
            Everything below is customisable. Upload your logo once on the next
            step and we handle the rest.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-3">
        {/* Col 1 — What's in it, and the polo choices */}
        <div>
          <Label>What is included</Label>
          <ul className="mb-8 grid gap-2">
            {CONTENTS.map((item) => (
              <li
                key={item.name}
                className="flex gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3"
              >
                <span className="text-sm font-extrabold text-gold-deep">{item.qty}×</span>
                <span>
                  <span className="block text-sm font-bold">{item.name}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">{item.note}</span>
                </span>
              </li>
            ))}
          </ul>

          <Label>Polo colour</Label>
          <div className="mb-3 flex flex-wrap gap-2">
            {POLO_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={poloColor === c.name}
                onClick={() => setPoloColor(c.name)}
                style={{ background: c.hex }}
                className={`h-8 w-8 rounded-full border shadow-sm transition ${
                  poloColor === c.name
                    ? "border-[#13294b] ring-2 ring-[#13294b]/30"
                    : "border-black/10 hover:scale-110"
                }`}
              />
            ))}
          </div>
          <p className="mb-8 text-xs text-gray-500">Selected: {poloColor}</p>

          <Label>Polo sizes</Label>
          <p className="mb-3 text-xs text-gray-500">
            Three polos. Pick a size for each, they do not have to match.
          </p>
          <div className="mb-8 grid gap-2">
            {poloSizes.map((size, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-16 text-xs font-bold text-gray-500">Polo {i + 1}</span>
                <select
                  value={size}
                  onChange={(e) => setPoloSize(i, e.target.value)}
                  aria-label={`Size for polo ${i + 1}`}
                  className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#13294b]"
                >
                  {POLO_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2 — Gallery */}
        <div>
          <div className="rounded-[1.75rem] border border-black/10 bg-[#f6f7f9] p-6">
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <Image
                src={view === 0 ? currentPolo.front : GALLERY[view].src}
                alt={view === 0 ? `${POLO_STYLE} in ${poloColor}` : GALLERY[view].alt}
                fill
                sizes="(min-width: 1024px) 380px, 90vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {GALLERY.map((g, i) => (
                <button
                  key={g.alt}
                  type="button"
                  onClick={() => setView(i)}
                  aria-pressed={view === i}
                  aria-label={g.alt}
                  className={`relative aspect-square rounded-xl border bg-white p-1 transition ${
                    view === i ? "border-[#13294b]" : "border-black/10 hover:border-[#d9d9d9]"
                  }`}
                >
                  <Image
                    src={i === 0 ? currentPolo.front : g.src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
              Cap and vest shown with a customer&apos;s logo. Yours goes in the
              same positions.
            </p>
          </div>
        </div>

        {/* Col 3 — Remaining choices + price */}
        <div>
          <Label>Cap colour</Label>
          <div className="mb-3 flex flex-wrap gap-2">
            {CAP_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={capColor === c.name}
                onClick={() => setCapColor(c.name)}
                style={{ background: c.hex }}
                className={`h-8 w-8 rounded-full border shadow-sm transition ${
                  capColor === c.name
                    ? "border-[#13294b] ring-2 ring-[#13294b]/30"
                    : "border-black/10 hover:scale-110"
                }`}
              />
            ))}
          </div>
          <p className="mb-8 text-xs text-gray-500">Selected: {capColor}</p>

          <Label>Safety vest size</Label>
          <div className="mb-8 grid grid-cols-3 gap-2">
            {VEST_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setVestSize(s)}
                aria-pressed={vestSize === s}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  vestSize === s
                    ? "border-[#e3b33d] bg-[#fff8e7]"
                    : "border-black/10 bg-white hover:border-[#d9d9d9]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <PriceSummary
            total={PRICE}
            perUnit={PRICE}
            unit="bundle"
            isValid
            onSubmit={goToUpload}
            summaryItems={summaryItems}
          />

          <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
            You will upload artwork for the polos, the cap, the vest and the
            stickers on the next step. Nothing is made until you approve a proof.
          </p>
        </div>
      </section>

      <ProcessSteps />
      <SiteFooter />
    </div>
  );
}
