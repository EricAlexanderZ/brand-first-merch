"use client";

/**
 * Custom Hats configurator.
 *
 * The catalog and the money both come from the Stitch Depot engine, ported here
 * verbatim: `lib/pricing.ts` holds the tier tables and `quoteOrder()`, and
 * `lib/products/caps.ts` holds the colorways and the photo path convention.
 * Ten styles across two brands, 442 real photographs, no emoji placeholders.
 *
 * Pricing is `(blank cost x (1 + markup)) + embroidery charges`, where the
 * quantity tier drives both the markup and the per-hat embroidery rates. Front
 * embroidery is the base of every order and is always charged; sides, back and
 * 3D puff are add-ons on top. That is materially different from the flat
 * per-quantity table this page used before, so the cart reprices hats through
 * the same engine rather than the old `getUnitPrice` table.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProcessSteps } from "@/components/process-steps";
import { PRODUCT_FEATURES } from "@/lib/products/features";
import { Feature, StickyOrderBar } from "@/components/products/product-ui";
import {
  CAP_BRANDS,
  MAX_QUANTITY,
  MIN_QUANTITY,
  clampQuantity,
  getStylesByBrand,
  placementLabel,
  quoteOrder,
  serializeAddOns,
  type CapBrand,
  type Placement,
  type PlacementArt,
  type PlacementPosition,
} from "@/lib/pricing";
import {
  capImage,
  getAngles,
  getCatalogEntry,
  type PreviewAngle,
} from "@/lib/products/caps";

const NAVY = "#13294b";

/**
 * What the configurator opens on.
 *
 * Lonestar leads because it is the newest range and the one worth showing
 * first. Resolved through the visible-styles check rather than used directly:
 * if every style in the preferred brand were hidden, naming it here would open
 * the page on a brand with nothing in it and throw on the first render.
 */
const PREFERRED_BRAND: CapBrand = "Lonestar";

function openingBrand(): CapBrand {
  return getStylesByBrand(PREFERRED_BRAND).length > 0
    ? PREFERRED_BRAND
    : (CAP_BRANDS.find((b) => getStylesByBrand(b).length > 0) ?? PREFERRED_BRAND);
}

/**
 * The only quantities offered as one-tap presets. Anything else is typed.
 * Each sits on a price break in PRICE_TIERS, so a tap always lands on the
 * best rate for that size of order.
 */
const QUANTITY_PRESETS = [1, 12, 25, 50, 100];

/** Side and back are the only optional positions; front is always included. */
const ADD_ON_POSITIONS: { position: PlacementPosition; label: string }[] = [
  { position: "left",  label: "Left Side" },
  { position: "right", label: "Right Side" },
  { position: "back",  label: "Back" },
];

export default function CustomHatsPage() {
  const router = useRouter();

  const [brand, setBrand]           = useState<CapBrand>(openingBrand);
  const [styleId, setStyleId]       = useState(() => getStylesByBrand(openingBrand())[0].id);
  const [selectedColor, setColor]   = useState(
    () => getCatalogEntry(getStylesByBrand(openingBrand())[0].id)!.colors[0].name
  );
  const [angle, setAngle]           = useState<PreviewAngle>("front");
  const [puff, setPuff]             = useState(false);
  const [quantity, setQuantity]     = useState(12);
  /**
   * The raw text of the custom-quantity box, kept separate from `quantity`.
   *
   * Deriving the input's value straight from the number made it impossible to
   * clear: backspacing to empty ran Number("") || MIN_QUANTITY, which is 1, so
   * the field instantly refilled and the last digit could never be deleted.
   * The text is authoritative while typing; `quantity` only follows when the
   * text parses to something valid.
   */
  const [qtyText, setQtyText]       = useState("12");

  /** Optional placements, keyed by position, each carrying its art grade. */
  const [addOns, setAddOns] = useState<Record<string, PlacementArt | undefined>>({});

  /** Photos that 404'd. Lets a swatch fall back to a colour chip. */
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const markMissing = (src: string) => setMissing((prev) => new Set(prev).add(src));

  const entry       = getCatalogEntry(styleId)!;
  const colors      = entry.colors;
  const angles      = getAngles(styleId);
  const brandStyles = useMemo(() => getStylesByBrand(brand), [brand]);

  /**
   * Only brands that currently have something to sell.
   *
   * A brand whose styles are all hidden still had a tab, and selecting it ran
   * getStylesByBrand(next)[0].id against an empty array, which throws. Deriving
   * the tabs from visible styles means hiding the last style in a brand simply
   * removes the brand, which is what `hidden` is meant to do.
   */
  const visibleBrands = useMemo(
    () => CAP_BRANDS.filter((b) => getStylesByBrand(b).length > 0),
    []
  );

  const placements: Placement[] = useMemo(
    () =>
      ADD_ON_POSITIONS.filter((p) => addOns[p.position]).map((p) => ({
        position: p.position,
        art:      addOns[p.position] as PlacementArt,
      })),
    [addOns]
  );

  const quote = useMemo(
    () => quoteOrder({ styleId, quantity, placements, puff }),
    [styleId, quantity, placements, puff]
  );

  /** Switching style must reset the colour — colourways are per style. */
  function chooseStyle(id: string) {
    setStyleId(id);
    const next = getCatalogEntry(id);
    if (next) setColor(next.colors[0].name);
    // A style may not have every angle; fall back rather than render a blank.
    setAngle("front");
  }

  function chooseBrand(next: CapBrand) {
    const first = getStylesByBrand(next)[0];
    if (!first) return; // brand has nothing visible; leave the selection alone
    setBrand(next);
    chooseStyle(first.id);
  }

  function toggleAddOn(position: PlacementPosition) {
    setAddOns((prev) => ({
      ...prev,
      [position]: prev[position] ? undefined : "design",
    }));
  }

  function setArt(position: PlacementPosition, art: PlacementArt) {
    setAddOns((prev) => ({ ...prev, [position]: art }));
  }

  function goToUpload() {
    const labels = [
      "Front of Cap",
      ...placements.map((p) => placementLabel(p)),
    ];

    sessionStorage.setItem("cartItemImage", capImage(styleId, selectedColor, "front"));

    const params = new URLSearchParams({
      productType: "Custom Hats",
      style:       entry.fullName,
      color:       selectedColor,
      quantity:    String(quote.quantity),
      placement:   labels.join(","),
      stitchType:  puff ? "3D Puff Stitched Hat" : "Regular Stitched Hat",
      total:       quote.total.toFixed(2),
      perUnit:     quote.perHat.toFixed(2),
      minQty:      String(MIN_QUANTITY),
      // Every charge already rides in perUnit under this engine, so there is no
      // flat fee and no separate per-piece upcharge to add on top.
      flatUpcharge:     "0",
      perPieceUpcharge: "0",
      // Carried so the cart can requote through the same engine when the
      // shopper changes quantity. Read by the cart provider, not displayed.
      styleId,
      addOns: serializeAddOns(placements),
    });

    router.push(`/upload-artwork?${params.toString()}`);
  }

  const previewSrc = capImage(styleId, selectedColor, angle);
  const previewOk  = !missing.has(previewSrc);
  const colorData  = colors.find((c) => c.name === selectedColor) ?? colors[0];

  return (
    <>
      <TopBanner />
      <SiteHeader />

      <main>
        <section className="bg-[#111111] py-14 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e3b33d]">Custom embroidery</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Custom Hats</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/70">
              Ten styles from OTTO and Pitbull Caps, embroidered in house. Pick a style, pick a
              colorway, and your price updates as you go.
            </p>
          </div>
        </section>

        <section className="bg-[#ececeb] py-12">
          <div className="mx-auto max-w-7xl px-6">

            {/* ── Brand ─────────────────────────────────────────────────── */}
            <Label>Brand</Label>
            <div className="mb-8 flex flex-wrap gap-3">
              {visibleBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => chooseBrand(b)}
                  aria-pressed={brand === b}
                  className={`min-h-11 rounded-full px-5 text-sm font-bold transition ${
                    brand === b
                      ? "bg-[#13294b] text-white shadow"
                      : "border border-black/10 bg-white text-[#13294b] hover:border-[#13294b]/40"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* ── Style ─────────────────────────────────────────────────── */}
            <Label>Hat Style</Label>
            <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {brandStyles.map((s) => {
                const active = s.id === styleId;
                const thumb  = capImage(s.id, getCatalogEntry(s.id)!.colors[0].name, "front");
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => chooseStyle(s.id)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-3 text-center transition ${
                      active ? "border-[#13294b] shadow-md" : "border-transparent shadow-sm hover:border-[#13294b]/30"
                    }`}
                  >
                    <span className="relative h-20 w-full">
                      {!missing.has(thumb) && (
                        <Image
                          src={thumb}
                          alt={s.name}
                          fill
                          sizes="(max-width: 640px) 45vw, 160px"
                          className="object-contain"
                          onError={() => markMissing(thumb)}
                        />
                      )}
                    </span>
                    <span className="text-xs font-bold leading-snug text-[#13294b]">{s.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">

              {/* ── Preview + colours ───────────────────────────────────── */}
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="relative mx-auto flex h-72 w-full items-center justify-center sm:h-96">
                  {previewOk ? (
                    <Image
                      src={previewSrc}
                      alt={`${entry.fullName} in ${selectedColor}, ${angle} view`}
                      fill
                      sizes="(min-width: 1024px) 46vw, 92vw"
                      className="object-contain"
                      onError={() => markMissing(previewSrc)}
                      priority
                    />
                  ) : (
                    <div
                      className="h-40 w-40 rounded-3xl border border-black/10"
                      style={{
                        background: colorData.hex2
                          ? `linear-gradient(45deg, ${colorData.hex} 50%, ${colorData.hex2} 50%)`
                          : colorData.hex,
                      }}
                    />
                  )}
                </div>

                {/* Only the angles this style was actually photographed in. */}
                {angles.length > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    {angles.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAngle(a)}
                        aria-pressed={angle === a}
                        className={`min-h-11 rounded-full px-4 text-xs font-bold capitalize transition ${
                          angle === a ? "bg-[#13294b] text-white" : "bg-black/5 text-[#13294b] hover:bg-black/10"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-center text-sm font-semibold text-[#13294b]">
                  {entry.name} · {selectedColor}
                </p>

                {/*
                  Photo swatches, same as Stitch Depot: each shows that colorway's
                  own front photo and degrades to a colour chip if the file is
                  missing.

                  The scroll box is a WRAPPER, never the grid. A max-height on the
                  grid itself compresses its rows and crops every cap. Cell height
                  is explicit for the same reason.
                */}
                <div className="mt-4 border-t border-black/5 pt-4">
                  <p className="mb-3 text-sm font-medium text-gray-600">
                    Color: <span className="font-bold text-[#13294b]">{selectedColor}</span>
                    <span className="ml-1 text-xs">({colors.length})</span>
                  </p>
                  <div className="max-h-[21rem] overflow-y-auto pr-1 sm:max-h-80">
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                      {colors.map((color) => {
                        const thumb    = capImage(styleId, color.name, "front");
                        const hasImage = !missing.has(thumb);
                        const active   = selectedColor === color.name;
                        return (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => { setColor(color.name); setAngle("front"); }}
                            title={color.name}
                            aria-pressed={active}
                            className={`relative h-24 w-full shrink-0 overflow-hidden rounded-xl border-2 transition hover:scale-105 sm:h-20 ${
                              active ? "border-[#13294b] ring-2 ring-[#13294b]/25" : "border-black/10"
                            } ${hasImage ? "bg-[#f5f5f5]" : ""}`}
                            style={
                              hasImage
                                ? undefined
                                : {
                                    background: color.hex2
                                      ? `linear-gradient(45deg, ${color.hex} 50%, ${color.hex2} 50%)`
                                      : color.hex,
                                  }
                            }
                          >
                            {hasImage && (
                              <Image
                                src={thumb}
                                alt={color.name}
                                fill
                                sizes="(max-width: 640px) 30vw, 120px"
                                className="object-contain p-1.5"
                                onError={() => markMissing(thumb)}
                              />
                            )}
                            <span className="sr-only">{color.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Options + price ─────────────────────────────────────── */}
              <div className="flex flex-col gap-6">

                <div>
                  <Label>Embroidery Placement</Label>

                  {/* Front is the base of every order and cannot be removed. */}
                  <div className="flex items-center justify-between rounded-2xl border-2 border-[#13294b] bg-[#13294b]/10 px-4 py-3 text-sm font-semibold text-[#13294b]">
                    <span>
                      Front of Cap
                      <span className="ml-2 text-xs font-normal text-gray-600">Included</span>
                    </span>
                    <span className="shrink-0 text-xs">${quote.tier.front.toFixed(2)}/hat</span>
                  </div>

                  <div className="mt-3 space-y-3">
                    {ADD_ON_POSITIONS.map(({ position, label }) => {
                      const art = addOns[position];
                      return (
                        <div key={position} className="rounded-2xl border border-black/10 bg-white p-3">
                          <button
                            type="button"
                            onClick={() => toggleAddOn(position)}
                            aria-pressed={!!art}
                            className="flex min-h-11 w-full items-center justify-between text-sm font-semibold text-[#13294b]"
                          >
                            <span>{label}</span>
                            <span className={`ml-3 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${art ? "border-[#13294b] bg-[#13294b] text-white" : "border-black/20"}`}>
                              {art ? "✓" : ""}
                            </span>
                          </button>

                          {/* Text and design are priced differently, so the grade
                              is only asked for once the position is switched on. */}
                          {art && (
                            <div className="mt-3 flex gap-2">
                              {(["text", "design"] as PlacementArt[]).map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => setArt(position, g)}
                                  aria-pressed={art === g}
                                  className={`min-h-11 flex-1 rounded-xl px-3 text-xs font-bold capitalize transition ${
                                    art === g ? "bg-[#13294b] text-white" : "bg-black/5 text-[#13294b] hover:bg-black/10"
                                  }`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>Stitch Type</Label>
                  <div className="flex gap-3">
                    {[false, true].map((isPuff) => (
                      <button
                        key={String(isPuff)}
                        type="button"
                        onClick={() => setPuff(isPuff)}
                        aria-pressed={puff === isPuff}
                        className={`min-h-11 flex-1 rounded-2xl px-4 text-sm font-bold transition ${
                          puff === isPuff
                            ? "bg-[#13294b] text-white shadow"
                            : "border border-black/10 bg-white text-[#13294b] hover:border-[#13294b]/40"
                        }`}
                      >
                        {isPuff ? "3D Puff" : "Regular"}
                        {isPuff && (
                          <span className="ml-1 text-xs font-normal opacity-80">
                            +${quote.tier.puff.toFixed(2)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Quantity</Label>
                  <div className="flex flex-wrap gap-2">
                    {QUANTITY_PRESETS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => { setQuantity(q); setQtyText(String(q)); }}
                        aria-pressed={quantity === q}
                        className={`min-h-11 min-w-16 rounded-xl px-4 text-sm font-bold transition ${
                          quantity === q
                            ? "bg-[#13294b] text-white"
                            : "border border-black/10 bg-white text-[#13294b] hover:border-[#13294b]/40"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qtyText}
                    onChange={(e) => {
                      const next = e.target.value;
                      // Let the box be empty or mid-edit. Only digits are kept,
                      // and `quantity` follows only once the text is a number.
                      if (next !== "" && !/^\d+$/.test(next)) return;
                      setQtyText(next);
                      if (next !== "") setQuantity(clampQuantity(Number(next)));
                    }}
                    onBlur={() => {
                      // Leaving it empty would show a blank box against a real
                      // price, so restore whatever is actually being quoted.
                      if (qtyText === "" || Number(qtyText) < MIN_QUANTITY) setQtyText(String(quantity));
                    }}
                    placeholder="Custom Quantity"
                    aria-label="Custom quantity"
                    className="mt-3 h-12 w-full rounded-xl border border-black/15 px-4 text-base font-semibold text-[#13294b] placeholder:font-normal placeholder:text-gray-400"
                  />
                </div>

                {/* ── Quote ───────────────────────────────────────────── */}
                <div className="rounded-3xl bg-[#111111] p-5 text-white">
                  <div className="space-y-1.5 text-sm">
                    {quote.lines.map((line) => (
                      <div key={line.label} className="flex justify-between text-white/70">
                        <span>{line.label}</span>
                        <span className="tabular-nums">${line.perHat.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-white/15 pt-4">
                    <span className="text-sm text-white/70">Per hat</span>
                    <span className="text-2xl font-extrabold tabular-nums text-[#e3b33d]">
                      ${quote.perHat.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-sm text-white/70">{quote.quantity} hats</span>
                    <span className="text-xl font-extrabold tabular-nums">${quote.total.toFixed(2)}</span>
                  </div>

                  {quote.freeShipping && (
                    <p className="mt-3 text-xs font-semibold text-[#e3b33d]">Free shipping included</p>
                  )}

                  <StickyOrderBar
                    watchId="hat-continue"
                    total={quote.total}
                    caption={`${quote.quantity} hats · ${quote.perHat.toFixed(2)} each`}
                    onSubmit={goToUpload}
                  />

                  <button
                    id="hat-continue"
                    type="button"
                    onClick={goToUpload}
                    className="mt-5 min-h-12 w-full rounded-full bg-[#e3b33d] px-6 text-base font-extrabold text-[#111111] transition hover:bg-[#f0c04d]"
                  >
                    Continue to Artwork
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_FEATURES.map((f) => (
              <Feature key={f.title} {...f} />
            ))}
          </div>
        </section>

        <ProcessSteps />
      </main>

      <SiteFooter />
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#13294b]">
      {children}
    </p>
  );
}
