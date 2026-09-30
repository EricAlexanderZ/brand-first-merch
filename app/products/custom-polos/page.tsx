"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_FEATURES } from "@/lib/products/features";
import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProcessSteps } from "@/components/process-steps";
import {
  Label,
  PlacementButton,
  Feature,
  ReviewCard,
  ColorPicker,
  ProductPreview,
  QuantitySelector,
  PriceSummary,
  type QuantityOption,
} from "@/components/products/product-ui";
import { getUnitPrice } from "@/lib/products/pricing";

// ─── Data ─────────────────────────────────────────────────────

const STYLE = "BAW 100% Polyester Polo";

type PoloColor = { name: string; hex: string; front: string };

const BASE = "/images/home/BAW%20Polos/";
const img  = (front: string): { front: string } => ({ front: BASE + front });

const colors: PoloColor[] = [
  { name: "Black",         hex: "#111111", ...img("Black_Front.jpeg")         },
  { name: "Canary",        hex: "#f5d000", ...img("Canary_Front.jpeg")        },
  { name: "Cardinal",      hex: "#8b1a2a", ...img("Cardinal_Front.jpeg")      },
  { name: "Charcoal",      hex: "#4a4a4a", ...img("Charcoal_Front.jpeg")      },
  { name: "Columbia Blue", hex: "#6ea8cd", ...img("Columbia_Blue_Front.jpeg") },
  { name: "Dark Green",    hex: "#1f5f3b", ...img("Dark_Green_Front.jpeg")    },
  { name: "Gold",          hex: "#c4922a", ...img("Gold_Front.jpeg")          },
  { name: "Heathered Gray",hex: "#9e9e9e", ...img("Heathered_Gray_Front.jpeg")},
  { name: "Kelly",         hex: "#2e7d32", ...img("Kelly_Front.jpeg")         },
  { name: "Light Pink",    hex: "#f5b8c8", ...img("Light_Pink_Front.jpeg")    },
  { name: "Maroon",        hex: "#6b1023", ...img("Maroon_Front.jpeg")        },
  { name: "Navy",          hex: "#13294b", ...img("Navy_Front.jpeg")          },
  { name: "Neon Pink",     hex: "#f060a0", ...img("Neon_Pink_Front.jpeg")     },
  { name: "Orange",        hex: "#e87020", ...img("Orange_Front.jpeg")        },
  { name: "Peach",         hex: "#f4b896", ...img("Peach_Front.jpeg")         },
  { name: "Purple",        hex: "#6b3494", ...img("Purple_Front.jpeg")        },
  { name: "Red",           hex: "#cc2222", ...img("Red_Front.jpeg")           },
  { name: "Royal",         hex: "#2355b8", ...img("Royal_Front.jpeg")         },
  { name: "Sea Foam",      hex: "#5fbfad", ...img("Sea_Foam_Front.jpeg")      },
  { name: "Silver",        hex: "#c0c0c0", ...img("Silver_Front.jpeg")        },
  { name: "Sky Blue",      hex: "#4db8e8", ...img("Sky_Blue_Front.jpeg")      },
  { name: "Teal",          hex: "#008080", ...img("Teal_Front.jpeg")          },
  { name: "Texas Orange",  hex: "#c14c00", ...img("Texas_Orange_Front.jpeg")  },
  { name: "Vegas Gold",    hex: "#c5a028", ...img("Vegas_Gold_Front.jpeg")    },
  { name: "White",         hex: "#f5f5f5", ...img("White_Front.jpeg")         },
];

/**
 * One-tap presets. Anything else is typed into the custom box.
 *
 * Prices are computed from the tier table rather than written out, because a
 * hardcoded list silently goes stale the moment pricing changes and the button
 * then advertises a number the cart will not honour.
 */
const QUANTITY_PRESETS = [1, 5, 10, 20, 30];

const quantities: QuantityOption[] = QUANTITY_PRESETS.map((qty) => ({
  label: `${qty} Polo${qty === 1 ? "" : "s"}`,
  qty,
  price: qty * getUnitPrice("Custom Polos", qty),
}));

/*
 * Cut, not a separate product.
 *
 * A women's polo is the same garment class, the same embroidery and the same
 * price as the men's, so it belongs here rather than on a page of its own: one
 * price table to keep current, and a customer kitting out a mixed team picks
 * per line instead of checking out twice.
 *
 * `photo` is set only where a real per-colour photograph exists. The men's line
 * has 25; the women's cuts currently have one mockup each, so they fall back to
 * that single image and the UI says so rather than implying the shown colour is
 * the only one available. Drop more photos in and the fallback stops applying.
 */
type Fit = {
  id: string;
  label: string;
  /** Shown when the selected colour has no photograph for this cut. */
  fallbackImage?: string;
  note?: string;
};

const FITS: Fit[] = [
  { id: "mens", label: "Men's" },
  {
    id: "womens",
    label: "Women's",
    fallbackImage: "/images/products/polo-womens.webp",
    note: "Women's cut, short sleeve. Photographed in one colourway; the full colour range below is available.",
  },
  {
    id: "womens-34",
    label: "Women's 3/4 Sleeve",
    fallbackImage: "/images/products/polo-womens-three-quarter.webp",
    note: "Women's cut, three-quarter sleeve. Photographed in one colourway; the full colour range below is available.",
  },
];

const DUAL_PER_PIECE = 5;

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const reviews = [
  { initials: "JM", title: "Great for our team uniforms",  date: "04/10/2026", text: "The polos came out sharp. Clean embroidery, great color, and the team loved them." },
  { initials: "SR", title: "Professional and clean",        date: "04/06/2026", text: "Ordered for a corporate event. The left chest logo was crisp and the fit was great." },
  { initials: "TL", title: "Solid quality",                 date: "03/29/2026", text: "Fast turnaround and the proof process was easy. Will be ordering again." },
];

// ─── Helpers ──────────────────────────────────────────────────


function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z\s-]/g, "").slice(0, 24);
}

// ─── Page ─────────────────────────────────────────────────────

export default function CustomPolosPage() {
  const router = useRouter();

  const [selectedFit,         setSelectedFit]         = useState<string>("mens");
  const [selectedColor,       setSelectedColor]       = useState("Black");
  const [selectedQuantity,    setSelectedQuantity]    = useState("5 Polos");
  const [isCustomQuantity,    setIsCustomQuantity]    = useState(false);
  const [customQuantity,      setCustomQuantity]      = useState("");
  const [customQuantityError, setCustomQuantityError] = useState("");
  const [leftChest,           setLeftChest]           = useState(true);
  const [rightSideName,       setRightSideName]       = useState(false);
  const [customerName,        setCustomerName]        = useState("");
  const [sizeBreakdown,       setSizeBreakdown]       = useState<Record<string, number>>(
    Object.fromEntries(SIZES.map((s) => [s, 0]))
  );

  const currentQty = useMemo(
    () => quantities.find((q) => q.label === selectedQuantity) ?? quantities[0],
    [selectedQuantity]
  );

  /*
   * Honour ?fit=<id> so the "Women's Polos" tile lands on the right cut.
   *
   * Read in an effect rather than with useSearchParams: that hook opts the
   * route out of static rendering unless it is wrapped in Suspense, and this
   * page has no other reason to be dynamic. Reading it during render from
   * window would mismatch hydration instead.
   */
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("fit");
    if (wanted && FITS.some((f) => f.id === wanted)) setSelectedFit(wanted);
  }, []);

  const currentColor = colors.find((c) => c.name === selectedColor) ?? colors[0];
  const currentFit   = FITS.find((f) => f.id === selectedFit) ?? FITS[0];
  // Men's shows the real photograph for the chosen colour; the women's cuts
  // fall back to their mockup until per-colour photos exist.
  const previewImage = currentFit.fallbackImage ?? currentColor.front;
  const fitStyle     = currentFit.id === "mens" ? STYLE : `${STYLE} (${currentFit.label})`;

  const parsedCustomQty = Number(customQuantity);
  const customQtyIsValid =
    customQuantity.trim() !== "" &&
    Number.isFinite(parsedCustomQty) &&
    Number.isInteger(parsedCustomQty) &&
    parsedCustomQty >= 1;

  const dualPerPiece = leftChest && rightSideName ? DUAL_PER_PIECE : 0;
  const activeQty    = isCustomQuantity && customQtyIsValid ? parsedCustomQty : currentQty.qty;
  const baseTotal    = isCustomQuantity && customQtyIsValid
    ? parsedCustomQty * getUnitPrice("Custom Polos", parsedCustomQty)
    : currentQty.price;
  const total    = baseTotal + dualPerPiece * activeQty;
  const perUnit  = activeQty > 0 ? total / activeQty : 0;
  const isOrderValid = !isCustomQuantity || customQtyIsValid;

  function togglePlacement(type: "leftChest" | "rightSideName") {
    if (type === "leftChest") {
      if (leftChest && !rightSideName) return;
      setLeftChest((prev) => !prev);
    } else {
      if (rightSideName && !leftChest) return;
      setRightSideName((prev) => !prev);
      if (rightSideName) setCustomerName("");
    }
  }

  function handlePresetSelect(label: string) {
    setIsCustomQuantity(false);
    setSelectedQuantity(label);
    setCustomQuantity("");
    setCustomQuantityError("");
  }

  function handleCustomChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === "") { setCustomQuantity(""); setCustomQuantityError("Please enter a quantity."); return; }
    if (!/^\d+$/.test(value)) { setCustomQuantity(value); setCustomQuantityError("Please enter numbers only."); return; }
    const qty = Number.parseInt(value, 10);
    setCustomQuantity(value);
    setCustomQuantityError(qty < 1 ? "Enter a quantity of 1 or more." : "");
  }

  function handleCustomFocus() {
    setIsCustomQuantity(true);
    if (!customQuantity) setCustomQuantityError("Please enter a quantity.");
  }

  function goToUpload() {
    const placement = [leftChest ? "Left Chest Logo" : null, rightSideName ? "Right Side Name" : null]
      .filter(Boolean).join(", ");
    const sizes = SIZES.filter((s) => (sizeBreakdown[s] || 0) > 0)
      .map((s) => `${s}×${sizeBreakdown[s]}`).join(", ");
    sessionStorage.setItem("cartItemImage", previewImage);
    const params = new URLSearchParams({
      productType:      "Custom Polos",
      style:            fitStyle,
      color:            selectedColor,
      quantity:         isCustomQuantity && customQtyIsValid ? String(parsedCustomQty) : selectedQuantity,
      placement,
      ...(rightSideName && customerName ? { sideName: customerName } : {}),
      ...(sizes ? { sizes } : {}),
      total:            String(total),
      perUnit:          String(perUnit),
      minQty:           "1",
      flatUpcharge:     "0",
      perPieceUpcharge: String(dualPerPiece),
    });
    router.push(`/upload-artwork?${params.toString()}`);
  }

  const placementLabel = [leftChest ? "Left Chest Logo" : null, rightSideName ? "Right Side Name" : null]
    .filter(Boolean).join(", ");

  const sizeSummary = SIZES.filter((s) => (sizeBreakdown[s] || 0) > 0)
    .map((s) => `${s}×${sizeBreakdown[s]}`).join(", ");

  const summaryItems = [
    { label: "Style",     value: fitStyle },
    { label: "Color",     value: selectedColor },
    { label: "Placement", value: placementLabel },
    ...(rightSideName && customerName ? [{ label: "Side Name", value: customerName }] : []),
    ...(dualPerPiece > 0 ? [{ label: "Dual Placement", value: `+$${dualPerPiece.toFixed(2)}/polo` }] : []),
    ...(sizeSummary ? [{ label: "Sizes", value: sizeSummary }] : []),
    {
      label: "Quantity",
      value: isCustomQuantity && customQtyIsValid ? `${parsedCustomQty} Polos` : selectedQuantity,
    },
  ];

  return (
    <main className="min-h-dvh bg-[#f6f6f4] text-black">
      <TopBanner />
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-black/5 bg-[#f6f6f4]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:gap-12 px-6 py-16 lg:grid-cols-2">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Custom Polos</h1>
            <p className="mt-2 text-base font-semibold text-[#13294b]">{STYLE}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="text-[#f0b100]">★★★★★</span>
              <span>5.0 average</span>
              <span>·</span>
              <span>No minimum order</span>
            </div>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Moisture-wicking 100% polyester with a clean embroidery surface. Order custom
              embroidered polos for your brand, team, or business — starting at just 5 pieces.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Available in {colors.length} colors
            </p>
            <div className="hidden sm:flex max-w-xs sm:max-w-sm flex-wrap justify-center gap-2">
              {colors.map((color) => (
                <div
                  key={color.name}
                  title={color.name}
                  className="h-7 w-7 rounded-full border border-black/10 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Configurator */}
      <section className="bg-[#ececeb] py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-[1.2fr_1.4fr_1.4fr_1fr]">

          {/* Col 1 — Style + Fit + Placement */}
          <div>
            <Label>Style</Label>
            <div className="mb-8 rounded-2xl border border-[#e3b33d] bg-[#fff8e7] px-4 py-4 shadow-sm">
              <span className="text-sm font-semibold">{STYLE}</span>
              <span className="mt-1 block text-xs text-[#d39a14]">★ Selected</span>
            </div>

            <Label>Fit</Label>
            <div className="mb-3 grid gap-2">
              {FITS.map((fit) => (
                <button
                  key={fit.id}
                  type="button"
                  onClick={() => setSelectedFit(fit.id)}
                  aria-pressed={selectedFit === fit.id}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    selectedFit === fit.id
                      ? "border-[#e3b33d] bg-[#fff8e7]"
                      : "border-black/10 bg-white hover:border-[#d9d9d9]"
                  }`}
                >
                  {fit.label}
                  {selectedFit === fit.id && (
                    <span className="ml-2 text-xs text-[#d39a14]">★ Selected</span>
                  )}
                </button>
              ))}
            </div>

            {/* Said plainly rather than implying the shown colour is the only
                one, which is what a single mockup would otherwise suggest. */}
            {currentFit.note && (
              <p className="mb-8 text-xs leading-relaxed text-gray-500">{currentFit.note}</p>
            )}
          </div>

          {/* Col 2 — Preview + Color (in modal) */}
          <div>
            <ProductPreview
              src={previewImage}
              alt={
                currentFit.fallbackImage
                  ? `${fitStyle}, sample colourway`
                  : `${fitStyle} in ${selectedColor}`
              }
              fallbackHex={currentColor.hex}
              fallbackEmoji="👔"
              // Where the cut has no per-colour photograph, the caption must
              // not assert the selected colour: "· Black" under a pink shirt
              // reads as a bug, not as a stand-in.
              label={
                currentFit.fallbackImage
                  ? `${fitStyle} · ${selectedColor} (shown in a sample colourway)`
                  : `${fitStyle} · ${selectedColor}`
              }
              colorPickerSlot={
                <ColorPicker
                  colors={colors.map((c) => ({ name: c.name, hex: c.hex, image: c.front }))}
                  selectedColor={selectedColor}
                  onSelect={setSelectedColor}
                />
              }
            />

            <div className="mt-8">
              <Label>Embroidery Placement</Label>
              <div className="grid grid-cols-1 gap-3">
                <PlacementButton label="Left Chest Logo"  selected={leftChest}     onClick={() => togglePlacement("leftChest")}     />
                <PlacementButton label="Right Side Name"  selected={rightSideName} onClick={() => togglePlacement("rightSideName")} />
              </div>

              {rightSideName && (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Name to embroider
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(sanitizeName(e.target.value))}
                    placeholder="e.g. Johnson"
                    maxLength={24}
                    className="w-full rounded-2xl border border-[#e3b33d] bg-white px-4 py-3 text-sm font-medium outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">Letters only · {customerName.length}/24</p>
                </div>
              )}

              {dualPerPiece > 0 && (
                <p className="mt-3 text-xs font-semibold text-[#d39a14]">
                  ★ Dual placement adds ${DUAL_PER_PIECE}/polo to your order
                </p>
              )}
            </div>

            <div className="mt-8">
              <Label>Size Breakdown</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {SIZES.map((size) => (
                  <div key={size} className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-600">{size}</span>
                    <input
                      type="number"
                      min={0}
                      value={sizeBreakdown[size] || ""}
                      placeholder="0"
                      onChange={(e) => setSizeBreakdown((prev) => ({
                        ...prev,
                        [size]: Math.max(0, Number(e.target.value) || 0),
                      }))}
                      className="w-full rounded-xl border border-black/10 bg-white px-1 py-2 text-center text-sm outline-none focus:border-[#e3b33d]"
                    />
                  </div>
                ))}
              </div>
              {(() => {
                const total = SIZES.reduce((s, sz) => s + (sizeBreakdown[sz] || 0), 0);
                return total > 0 ? (
                  <p className="mt-2 text-xs text-gray-500">Total: {total} piece{total !== 1 ? "s" : ""} across all sizes</p>
                ) : null;
              })()}
            </div>
          </div>

          {/* Col 3 — Quantity */}
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
              perPieceUpcharge={dualPerPiece}
              onPresetSelect={handlePresetSelect}
              onCustomChange={handleCustomChange}
              onCustomFocus={handleCustomFocus}
            />
          </div>

          {/* Col 4 — Price */}
          <div>
            <PriceSummary
              total={total}
              perUnit={perUnit}
              unit="polo"
              isValid={isOrderValid}
              onSubmit={goToUpload}
              summaryItems={summaryItems}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 text-center md:grid-cols-3">
          {PRODUCT_FEATURES.map((f) => <Feature key={f.title} image={f.image} title={f.title} text={f.text} />)}
        </div>
      </section>

      <ProcessSteps />

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight">Customer reviews</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div><p className="text-4xl font-extrabold">5/5</p><p className="mt-2 text-sm text-gray-500">Average reviews</p></div>
              <div><p className="text-4xl font-extrabold">56</p><p className="mt-2 text-sm text-gray-500">Total reviews</p></div>
              <div><p className="text-4xl font-extrabold">100%</p><p className="mt-2 text-sm text-gray-500">Would order again</p></div>
            </div>
          </div>
          <div className="mt-12">
            {reviews.map((r) => <ReviewCard key={`${r.initials}-${r.title}`} {...r} />)}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
