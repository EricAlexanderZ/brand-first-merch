"use client";

import { ChangeEvent, useMemo, useState } from "react";
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
  SizeBreakdown,
  sizeBreakdownTotal,
  sizeBreakdownIsValid,
  type QuantityOption,
} from "@/components/products/product-ui";
import { getUnitPrice } from "@/lib/products/pricing";

// ─── Data ─────────────────────────────────────────────────────

const STYLE = "Gildan Heavy Blend Crewneck Sweatshirt";
const PRICE_PER_INCH = 5;
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const LOGO_WIDTHS = Array.from({ length: 12 }, (_, i) => +(3.5 + i * 0.5).toFixed(1)); // $5 per inch of logo width, per placement

type SweaterColor = { name: string; hex: string; front: string; back: string };

const BASE = "/images/home/Crewnecks/";
const img  = (front: string, back: string): { front: string; back: string } => ({
  front: BASE + front,
  back:  BASE + back,
});

const colors: SweaterColor[] = [
  { name: "Ash",                  hex: "#c8c8c6", ...img("Ash_Front.jpeg",                  "Ash_Back.jpeg")                  },
  { name: "Black",                hex: "#111111", ...img("Black_Front.jpeg",                "Black_Back.jpeg")                },
  { name: "Cardinal Red",         hex: "#8b1a2a", ...img("Cardinal_Red_Front.jpeg",         "Cardinal_Red_Back.jpeg")         },
  { name: "Carolina Blue",        hex: "#6ea8cd", ...img("Carolina_Blue_Front.jpeg",        "Carolina_Blue_Back.jpeg")        },
  { name: "Charcoal",             hex: "#4a4a4a", ...img("Charcoal_Front.jpeg",             "Charcoal_Back.jpeg")             },
  { name: "Cherry Red",           hex: "#a51c30", ...img("Cherry_Red_Front.jpeg",           "Cherry_Red_Back.jpeg")           },
  { name: "Dark Chocolate",       hex: "#3b1f14", ...img("Dark_Chocolate_Front.jpeg",       "Dark_Chocolate_Back.jpeg")       },
  { name: "Dark Heather",         hex: "#555555", ...img("Dark_Heather_Front.jpeg",         "Dark_Heather_Back.jpeg")         },
  { name: "Fan Charcoal Heather", hex: "#5a5a5a", ...img("Fan_Charcoal_Heather_Front.jpeg", "Fan_Charcoal_Heather_Back.jpeg") },
  { name: "Fan Dark Green",       hex: "#1a3d28", ...img("Fan_Dark_Green_Front.jpeg",       "Fan_Dark_Green_Back.jpeg")       },
  { name: "Fan Deep Royal",       hex: "#1a2f7a", ...img("Fan_Deep_Royal_Front.jpeg",       "Fan_Deep_Royal_Back.jpeg")       },
  { name: "Forest Green",         hex: "#1f5f3b", ...img("Forest_Green_Front.jpeg",         "Forest_Green_Back.jpeg")         },
  { name: "Garnet",               hex: "#6b1020", ...img("Garnet_Front.jpeg",               "Garnet_Back.jpeg")               },
  { name: "Gold",                 hex: "#f5a800", ...img("Gold_Front.jpeg",                 "Gold_Back.jpeg")                 },
  { name: "Graphite Heather",     hex: "#8c939d", ...img("Graphite_Heather_Front.jpeg",     "Graphite_Heather_Back.jpeg")     },
  { name: "Heather Dark Green",   hex: "#2d5a3d", ...img("Heather_Dark_Green_Front.jpeg",   "Heather_Dark_Green_Back.jpeg")   },
  { name: "Heather Dark Maroon",  hex: "#5a1a28", ...img("Heather_Dark_Maroon_Front.jpeg",  "Heather_Dark_Maroon_Back.jpeg")  },
  { name: "Heather Deep Royal",   hex: "#2a3f8f", ...img("Heather_Deep_Royal_Front.jpeg",   "Heather_Deep_Royal_Back.jpeg")   },
  { name: "Heather Scarlet Red",  hex: "#c0392b", ...img("Heather_Scarlet_Red_Front.jpeg",  "Heather_Scarlet_Red_Back.jpeg")  },
  { name: "Heliconia",            hex: "#e0407a", ...img("Heliconia_Front.jpeg",            "Heliconia_Back.jpeg")            },
  { name: "Indigo Blue",          hex: "#2e3f8f", ...img("Indigo_Blue_Front.jpeg",          "Indigo_Blue_Back.jpeg")          },
  { name: "Irish Green",          hex: "#2e7d32", ...img("Irish_Green_Front.jpeg",          "Irish_Green_Back.jpeg")          },
  { name: "Light Blue",           hex: "#a8c8e0", ...img("Light_Blue_Front.jpeg",           "Light_Blue_Back.jpeg")           },
  { name: "Light Pink",           hex: "#f5b8c8", ...img("Light_Pink_Front.jpeg",           "Light_Pink_Back.jpeg")           },
  { name: "Maroon",               hex: "#6b1023", ...img("Maroon_Front.jpeg",               "Maroon_Back.jpeg")               },
  { name: "Military Green",       hex: "#4a5728", ...img("Military_Green_Front.jpeg",       "Military_Green_Back.jpeg")       },
  { name: "Navy",                 hex: "#13294b", ...img("Navy_Front.jpeg",                 "Navy_Back.jpeg")                 },
  { name: "Neon Blue",            hex: "#0080ff", ...img("Neon_Blue_Front.jpeg",            "Neon_Blue_Back.jpeg")            },
  { name: "Orange",               hex: "#e87020", ...img("Orange_Front.jpeg",               "Orange_Back.jpeg")               },
  { name: "Purple",               hex: "#6b3494", ...img("Purple_Front.jpeg",               "Purple_Back.jpeg")               },
  { name: "Red",                  hex: "#cc2222", ...img("Red_Front.jpeg",                  "Red_Back.jpeg")                  },
  { name: "Royal",                hex: "#2355b8", ...img("Royal_Front.jpeg",                "Royal_Back.jpeg")                },
  { name: "Safety Green",         hex: "#aadd00", ...img("Safety_Green_Front.jpeg",         "Safety_Green_Back.jpeg")         },
  { name: "Safety Pink",          hex: "#f060a0", ...img("Safety_Pink_Front.jpeg",          "Safety_Pink_Back.jpeg")          },
  { name: "Sand",                 hex: "#cfc0a0", ...img("Sand_Front.jpeg",                 "Sand_Back.jpeg")                 },
  { name: "Sapphire",             hex: "#0f6fad", ...img("Sapphire_Front.jpeg",             "Sapphire_Back.jpeg")             },
  { name: "Sport Grey",           hex: "#a0a0a0", ...img("Sport_Grey_Front.jpeg",           "Sport_Grey_Back.jpeg")           },
  { name: "White",                hex: "#f5f5f5", ...img("White_Front.jpeg",                "White_Back.jpeg")                },
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
  label: `${qty} Sweater${qty === 1 ? "" : "s"}`,
  qty,
  price: qty * getUnitPrice("Custom Sweaters", qty),
}));


const reviews = [
  { initials: "RP", title: "Clean crewneck embroidery", date: "04/08/2026", text: "The chest logo came out perfectly. Great weight and the color held great after washing." },
  { initials: "CL", title: "Exactly what we needed",    date: "04/02/2026", text: "Ordered for our brand drop. The process was smooth and the sweaters looked premium." },
  { initials: "MF", title: "Solid quality",             date: "03/25/2026", text: "Fast turnaround and the embroidery was sharp. Will definitely reorder." },
];

// ─── Helpers ──────────────────────────────────────────────────


function clampWidth(value: number): number {
  return Math.min(9, Math.max(1, value));
}

// ─── Page ─────────────────────────────────────────────────────

export default function CustomSweatersPage() {
  const router = useRouter();

  const [selectedColor,       setSelectedColor]       = useState("Black");
  const [selectedQuantity,    setSelectedQuantity]    = useState("1 Sweater");
  const [isCustomQuantity,    setIsCustomQuantity]    = useState(false);
  const [customQuantity,      setCustomQuantity]      = useState("");
  const [customQuantityError, setCustomQuantityError] = useState("");
  const [chestLogo,           setChestLogo]           = useState(true);
  const [backLogo,            setBackLogo]            = useState(false);
  const [hasCustomSize,       setHasCustomSize]       = useState(false);
  const [chestWidth,          setChestWidth]          = useState(3.5);
  const [backWidth,           setBackWidth]           = useState(3.5);
  const [sizeBreakdown,       setSizeBreakdown]       = useState<Record<string, number>>(
    Object.fromEntries(SIZES.map((s) => [s, 0]))
  );

  const currentQty = useMemo(
    () => quantities.find((q) => q.label === selectedQuantity) ?? quantities[0],
    [selectedQuantity]
  );

  const currentColor = colors.find((c) => c.name === selectedColor) ?? colors[0];

  const parsedCustomQty = Number(customQuantity);
  const customQtyIsValid =
    customQuantity.trim() !== "" &&
    Number.isFinite(parsedCustomQty) &&
    Number.isInteger(parsedCustomQty) &&
    parsedCustomQty >= 1;

  // Base price includes one primary logo at 3.5". A second placement adds $17.50 (3.5" × $5).
  // Custom size adds extra only for inches above 3.5", per placement.
  const bothSelected   = chestLogo && backLogo;
  const backBase       = bothSelected ? 3.5 * PRICE_PER_INCH : 0;
  const chestSizeExtra = hasCustomSize && chestLogo ? Math.max(0, (chestWidth - 3.5) * PRICE_PER_INCH) : 0;
  const backSizeExtra  = hasCustomSize && backLogo  ? Math.max(0, (backWidth  - 3.5) * PRICE_PER_INCH) : 0;
  const logoUpcharge   = backBase + chestSizeExtra + backSizeExtra;

  const activeQty       = isCustomQuantity && customQtyIsValid ? parsedCustomQty : currentQty.qty;
  const baseTotal       = isCustomQuantity && customQtyIsValid
    ? parsedCustomQty * getUnitPrice("Custom Sweaters", parsedCustomQty)
    : currentQty.price;
  const total           = baseTotal + logoUpcharge;
  const perUnit         = activeQty > 0 ? total / activeQty : 0;
  const perUnitUpcharge = activeQty > 0 ? logoUpcharge / activeQty : 0;
  const sizesTotal   = sizeBreakdownTotal(SIZES, sizeBreakdown);
  // A breakdown that contradicts the order is worse than none: the shop
  // would receive two different quantities with no way to tell which was meant.
  const sizesOk      = sizeBreakdownIsValid(sizesTotal, activeQty);
  const isOrderValid = (!isCustomQuantity || customQtyIsValid) && sizesOk;

  function togglePlacement(type: "chest" | "back") {
    if (type === "chest") {
      if (chestLogo && !backLogo) return;
      setChestLogo((prev) => !prev);
    } else {
      if (backLogo && !chestLogo) return;
      setBackLogo((prev) => !prev);
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
    setCustomQuantityError(qty < 1 ? "Minimum order is 1 sweater." : "");
  }

  function handleCustomFocus() {
    setIsCustomQuantity(true);
    if (!customQuantity) setCustomQuantityError("Please enter a quantity.");
  }

  function goToUpload() {
    const placement = [chestLogo ? "Chest Logo" : null, backLogo ? "Back Logo" : null]
      .filter(Boolean).join(", ");

    const sizeParams: Record<string, string> = {};
    if (hasCustomSize) {
      if (chestLogo) sizeParams.chestLogoWidth = String(chestWidth);
      if (backLogo)  sizeParams.backLogoWidth  = String(backWidth);
    }

    const sizes = SIZES.filter((s) => (sizeBreakdown[s] || 0) > 0)
      .map((s) => `${s}×${sizeBreakdown[s]}`).join(", ");
    const params = new URLSearchParams({
      productType:      "Custom Sweaters",
      style:            STYLE,
      color:            selectedColor,
      quantity:         isCustomQuantity && customQtyIsValid ? String(parsedCustomQty) : selectedQuantity,
      placement,
      ...sizeParams,
      ...(sizes ? { sizes } : {}),
      total:            String(total),
      perUnit:          String(perUnit),
      minQty:           "1",
      flatUpcharge:     String(logoUpcharge),
      perPieceUpcharge: "0",
    });
    sessionStorage.setItem("cartItemImage", currentColor.front);
    router.push(`/upload-artwork?${params.toString()}`);
  }

  const placementLabel = [chestLogo ? "Chest Logo" : null, backLogo ? "Back Logo" : null]
    .filter(Boolean).join(", ");

  const sizeLabel = hasCustomSize
    ? [
        chestLogo ? `Chest: ${chestWidth}"` : null,
        backLogo  ? `Back: ${backWidth}"`   : null,
      ].filter(Boolean).join(", ")
    : null;

  const sizeSummary = SIZES.filter((s) => (sizeBreakdown[s] || 0) > 0)
    .map((s) => `${s}×${sizeBreakdown[s]}`).join(", ");

  const summaryItems = [
    { label: "Style",     value: STYLE },
    { label: "Color",     value: selectedColor },
    { label: "Placement", value: placementLabel },
    ...(sizeLabel ? [{ label: "Logo Width(s)", value: sizeLabel }] : []),
    ...(logoUpcharge > 0 ? [{ label: "Logo Size Upcharge", value: `+$${perUnitUpcharge.toFixed(2)}` }] : []),
    ...(sizeSummary ? [{ label: "Sizes", value: sizeSummary }] : []),
    {
      label: "Quantity",
      value: isCustomQuantity && customQtyIsValid ? `${parsedCustomQty} Sweaters` : selectedQuantity,
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Custom Sweaters</h1>
            <p className="mt-2 text-base font-semibold text-[#13294b]">{STYLE}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span className="text-[#f0b100]">★★★★★</span>
              <span>5.0 average</span>
              <span>·</span>
              <span>No minimum order</span>
            </div>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Order premium custom embroidered crewneck sweaters for your brand, team, or drop.
              Choose your color, placement, and logo size — starting at just one piece.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Available in {colors.length} colors</p>
            <div className="hidden sm:flex flex-wrap justify-center gap-2 max-w-xs sm:max-w-sm">
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

          {/* Col 1 — Style + Placement + Logo Size */}
          <div>
            <Label>Style</Label>
            <div className="mb-8 rounded-2xl border border-[#e3b33d] bg-[#fff8e7] px-4 py-4 shadow-sm">
              <span className="text-sm font-semibold">{STYLE}</span>
              <span className="mt-1 block text-xs text-[#d39a14]">★ Selected</span>
            </div>


          </div>

          {/* Col 2 — Preview + Color + Placement + Logo Size */}
          <div>
            <ProductPreview
              src={currentColor.front}
              backSrc={currentColor.back}
              alt={`${STYLE} in ${selectedColor}`}
              fallbackHex={currentColor.hex}
              fallbackEmoji="🧶"
              label={`${STYLE} · ${selectedColor}`}
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
                <PlacementButton label="Chest Logo" selected={chestLogo} onClick={() => togglePlacement("chest")} />
                <PlacementButton label="Back Logo"  selected={backLogo}  onClick={() => togglePlacement("back")}  />
              </div>
            </div>

            <div className="mt-8">
              <Label>Logo Size</Label>
              <div className="rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-sm">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasCustomSize}
                    onChange={(e) => setHasCustomSize(e.target.checked)}
                    className="h-4 w-4 accent-[#13294b]"
                  />
                  <span className="text-sm font-semibold">Custom logo size</span>
                </label>

                {hasCustomSize && (
                  <div className="mt-4 space-y-4">
                    {chestLogo && (
                      <div>
                        <p className="mb-1 text-xs font-semibold text-gray-500">Chest logo width (in)</p>
                        <select
                          value={chestWidth}
                          onChange={(e) => setChestWidth(Number(e.target.value))}
                          className="md:hidden w-full rounded-xl border border-[#e3b33d] px-3 py-2 outline-none"
                        >
                          {LOGO_WIDTHS.map((w) => (
                            <option key={w} value={w}>{w}"</option>
                          ))}
                        </select>
                        <input
                          type="number" min={3.5} max={9} step={0.5}
                          value={chestWidth}
                          onChange={(e) => setChestWidth(clampWidth(Number(e.target.value)))}
                          className="hidden md:block w-full rounded-xl border border-[#e3b33d] px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    )}
                    {backLogo && (
                      <div>
                        <p className="mb-1 text-xs font-semibold text-gray-500">Back logo width (in)</p>
                        <select
                          value={backWidth}
                          onChange={(e) => setBackWidth(Number(e.target.value))}
                          className="md:hidden w-full rounded-xl border border-[#e3b33d] px-3 py-2 outline-none"
                        >
                          {LOGO_WIDTHS.map((w) => (
                            <option key={w} value={w}>{w}"</option>
                          ))}
                        </select>
                        <input
                          type="number" min={3.5} max={9} step={0.5}
                          value={backWidth}
                          onChange={(e) => setBackWidth(clampWidth(Number(e.target.value)))}
                          className="hidden md:block w-full rounded-xl border border-[#e3b33d] px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      3.5″ included in base price · +${PRICE_PER_INCH}/inch above 3.5″
                    </p>
                    {logoUpcharge > 0 && (
                      <p className="text-xs font-semibold text-[#d39a14]">
                        ★ Logo upcharge: +${perUnitUpcharge.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8">
              <SizeBreakdown
                sizes={SIZES}
                breakdown={sizeBreakdown}
                orderQty={activeQty}
                unit="sweater"
                onChange={setSizeBreakdown}
              />
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
              upcharge={logoUpcharge}
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
              unit="sweater"
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
