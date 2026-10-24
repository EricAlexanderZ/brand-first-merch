"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Label, PlacementButton, ColorPicker, ProductPreview } from "@/components/products/product-ui";
import ArtworkUpload from "@/components/artwork-upload";
import StripePaymentForm, { type StripeFormHandle } from "@/components/checkout/stripe-payment-form";
import { PENDING_ORDER_KEY, type PendingOrder } from "@/lib/pending-order";
import type { DeliveryMethod } from "@/types/checkout";
import {
  PLACEMENTS,
  BACK_SIZE_OPTIONS,
  BACK_BASE_SIZE_IN,
  LOCAL_CITIES,
  EVERYDAY_POLO_UNIT_PRICE,
  SUPPLIED_RATE_FEW,
  SUPPLIED_RATE_MANY,
  EXTRA_LOGO_PRICE,
  BACK_OVERSIZE_PRICE,
  computeSubtotal,
  validateConfig,
  baseRatePerGarment,
  addOnsPerGarment,
  totalGarmentCount,
  promoWeightOz,
  backOversizeApplies,
  isLocalCity,
  type Placement,
  type PoloGender,
  type GarmentSource,
  type SuppliedGarment,
  type PromoConfig,
  type PromoFulfillment,
} from "@/lib/promo/everyday-polo";

// ─── Static data (polo colors) ────────────────────────────────────────────────

const BASE = "/images/home/BAW%20Polos/";
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

type PoloColor = { name: string; hex: string; front: string };
const COLORS: PoloColor[] = [
  { name: "Black", hex: "#111111", front: `${BASE}Black_Front.jpeg` },
  { name: "Canary", hex: "#f5d000", front: `${BASE}Canary_Front.jpeg` },
  { name: "Cardinal", hex: "#8b1a2a", front: `${BASE}Cardinal_Front.jpeg` },
  { name: "Charcoal", hex: "#4a4a4a", front: `${BASE}Charcoal_Front.jpeg` },
  { name: "Columbia Blue", hex: "#6ea8cd", front: `${BASE}Columbia_Blue_Front.jpeg` },
  { name: "Dark Green", hex: "#1f5f3b", front: `${BASE}Dark_Green_Front.jpeg` },
  { name: "Gold", hex: "#c4922a", front: `${BASE}Gold_Front.jpeg` },
  { name: "Heathered Gray", hex: "#9e9e9e", front: `${BASE}Heathered_Gray_Front.jpeg` },
  { name: "Kelly", hex: "#2e7d32", front: `${BASE}Kelly_Front.jpeg` },
  { name: "Light Pink", hex: "#f5b8c8", front: `${BASE}Light_Pink_Front.jpeg` },
  { name: "Maroon", hex: "#6b1023", front: `${BASE}Maroon_Front.jpeg` },
  { name: "Navy", hex: "#13294b", front: `${BASE}Navy_Front.jpeg` },
  { name: "Neon Pink", hex: "#f060a0", front: `${BASE}Neon_Pink_Front.jpeg` },
  { name: "Orange", hex: "#e87020", front: `${BASE}Orange_Front.jpeg` },
  { name: "Peach", hex: "#f4b896", front: `${BASE}Peach_Front.jpeg` },
  { name: "Purple", hex: "#6b3494", front: `${BASE}Purple_Front.jpeg` },
  { name: "Red", hex: "#cc2222", front: `${BASE}Red_Front.jpeg` },
  { name: "Royal", hex: "#2355b8", front: `${BASE}Royal_Front.jpeg` },
  { name: "Sea Foam", hex: "#5fbfad", front: `${BASE}Sea_Foam_Front.jpeg` },
  { name: "Silver", hex: "#c0c0c0", front: `${BASE}Silver_Front.jpeg` },
  { name: "Sky Blue", hex: "#4db8e8", front: `${BASE}Sky_Blue_Front.jpeg` },
  { name: "Teal", hex: "#008080", front: `${BASE}Teal_Front.jpeg` },
  { name: "Texas Orange", hex: "#c14c00", front: `${BASE}Texas_Orange_Front.jpeg` },
  { name: "Vegas Gold", hex: "#c5a028", front: `${BASE}Vegas_Gold_Front.jpeg` },
  { name: "White", hex: "#f5f5f5", front: `${BASE}White_Front.jpeg` },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyGarment(): SuppliedGarment {
  return { quantity: 1, brand: "", color: "", style: "Polo" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EverydayPoloClient() {
  const searchParams = useSearchParams();
  const trackingSource = searchParams.get("ref");

  // Garment source
  const [source, setSource] = useState<GarmentSource>("buy");

  // Buy-path state
  const [gender, setGender] = useState<PoloGender>("Men's");
  const [color, setColor] = useState("Black");
  const [sizes, setSizes] = useState<Record<string, number>>(
    Object.fromEntries(SIZES.map((s) => [s, 0]))
  );
  const [buyQtyStr, setBuyQtyStr] = useState("1");

  // Supply-path state
  const [garments, setGarments] = useState<SuppliedGarment[]>([emptyGarment()]);

  // Embroidery (shared). Left Chest is the default placement but can be changed.
  const [placements, setPlacements] = useState<Placement[]>(["Left Chest"]);
  const [backSizeIn, setBackSizeIn] = useState<number>(BACK_BASE_SIZE_IN);

  // Artwork — one logo file per selected placement
  const [artwork, setArtwork] = useState<Record<string, string>>({});
  const [instructions, setInstructions] = useState("");

  // Fulfillment
  const [isLocal, setIsLocal] = useState<boolean | null>(null);
  const [addr, setAddr] = useState({ line1: "", line2: "", city: "", state: "", zip: "" });
  const [rates, setRates] = useState<DeliveryMethod[]>([]);
  const [selectedRate, setSelectedRate] = useState<DeliveryMethod | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState("");

  // Contact
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Checkout
  const [stage, setStage] = useState<"configure" | "pay">("configure");
  const [clientSecret, setClientSecret] = useState("");
  const [serverTotal, setServerTotal] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const stripeRef = useRef<StripeFormHandle>(null);

  const currentColor = COLORS.find((c) => c.name === color) ?? COLORS[0];
  const buyQty = Math.max(0, Number.parseInt(buyQtyStr, 10) || 0);

  // ── Canonical config from state ────────────────────────────────────────────
  const embroidery = useMemo(() => ({ placements, backSizeIn }), [placements, backSizeIn]);

  const config: PromoConfig = useMemo(() => {
    if (source === "buy") {
      return { source: "buy", gender, color, sizes, quantity: buyQty, embroidery };
    }
    return { source: "supply", garments, embroidery };
  }, [source, gender, color, sizes, buyQty, garments, embroidery]);

  const configError = validateConfig(config);
  const subtotal = configError ? 0 : computeSubtotal(config);
  const garmentCount = totalGarmentCount(config);

  // ── Fulfillment + readiness ────────────────────────────────────────────────
  const addressFilled = Boolean(
    addr.line1.trim() && addr.city.trim() && addr.state.trim() && addr.zip.trim()
  );
  const localIsValid =
    addr.state.trim().toUpperCase() === "TX" && isLocalCity(addr.city);

  const fulfillment: PromoFulfillment | null = useMemo(() => {
    if (isLocal === true && addressFilled && localIsValid) {
      return {
        type: "local",
        method: "Local Pickup / Delivery",
        shippingPrice: 0,
        address: { ...addr },
      };
    }
    if (isLocal === false && selectedRate && addressFilled) {
      return {
        type: "shipping",
        method: selectedRate.label,
        shippingPrice: selectedRate.price,
        address: { ...addr },
      };
    }
    return null;
  }, [isLocal, addressFilled, localIsValid, selectedRate, addr]);

  const shippingPrice = fulfillment?.shippingPrice ?? 0;
  const grandTotal = subtotal + shippingPrice;

  const contactReady = name.trim() !== "" && EMAIL_RE.test(email) && phone.trim() !== "";
  const fulfillmentReady = Boolean(fulfillment);
  const canCheckout = !configError && contactReady && fulfillmentReady;

  // ── Actions ────────────────────────────────────────────────────────────────

  function togglePlacement(p: Placement) {
    if (placements.includes(p)) {
      if (placements.length === 1) return; // keep at least one logo
      setPlacements((prev) => prev.filter((x) => x !== p));
      setArtwork((prev) => {
        const next = { ...prev };
        delete next[p];
        return next;
      });
    } else {
      setPlacements((prev) => [...prev, p]);
    }
  }

  function setArt(placement: string, url: string) {
    setArtwork((prev) => {
      const next = { ...prev };
      if (url) next[placement] = url;
      else delete next[placement];
      return next;
    });
  }

  function updateGarment(idx: number, patch: Partial<SuppliedGarment>) {
    setGarments((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  }

  function addGarmentRow() {
    setGarments((prev) => [...prev, emptyGarment()]);
  }

  function removeGarmentRow(idx: number) {
    setGarments((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  }

  async function fetchRates() {
    if (!addressFilled) {
      setRatesError("Enter your full shipping address first.");
      return;
    }
    setRatesLoading(true);
    setRatesError("");
    setSelectedRate(null);
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: name || "Customer",
          lastName: "",
          address1: addr.line1,
          address2: addr.line2,
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
          country: "US",
          totalWeightOz: promoWeightOz(config),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not load shipping rates.");
      setRates(data.rates as DeliveryMethod[]);
    } catch (err) {
      setRatesError(err instanceof Error ? err.message : "Could not load shipping rates.");
    } finally {
      setRatesLoading(false);
    }
  }

  async function continueToPayment() {
    if (!canCheckout || !fulfillment) return;
    setCheckoutError("");
    setPlacing(true);
    try {
      const res = await fetch("/api/promo/everyday-polo/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, fulfillment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start checkout.");
      setClientSecret(data.clientSecret);
      setServerTotal(data.total);
      setStage("pay");
      setTimeout(() => {
        document.getElementById("promo-payment")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setPlacing(false);
    }
  }

  function editOrder() {
    setStage("configure");
    setClientSecret("");
    setCheckoutError("");
  }

  async function placeOrder() {
    if (!fulfillment || !clientSecret || !stripeRef.current) return;
    setCheckoutError("");
    setPlacing(true);
    try {
      await stripeRef.current.validate();

      const placementsWithArt = placements.filter((p) => artwork[p]);

      // Parked before charging and saved by the confirmation page, the same
      // way as main checkout: payment methods that leave the site to approve
      // never run code after confirmPayment, and those orders used to be
      // charged and never saved. See lib/pending-order.ts.
      const pending: PendingOrder = {
        endpoint: "/api/promo/everyday-polo",
        customerEmail: email.trim(),
        body: {
          config,
          fulfillment,
          customer: { name: name.trim(), email: email.trim(), phone: phone.trim() },
          trackingSource,
          artworkUrls: placementsWithArt.map((p) => artwork[p]),
          artworkPlacements: placementsWithArt,
          instructions,
        },
      };
      sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pending));

      const paymentIntentId = await stripeRef.current.confirmPayment(clientSecret);

      window.location.href =
        `/order-confirmation?payment_intent=${encodeURIComponent(paymentIntentId)}&redirect_status=succeeded`;
    } catch (err) {
      sessionStorage.removeItem(PENDING_ORDER_KEY);
      setCheckoutError(err instanceof Error ? err.message : "Payment failed.");
      setPlacing(false);
    }
  }

  // ── Live summary values ────────────────────────────────────────────────────
  const baseRate = baseRatePerGarment(config);
  const addOns = addOnsPerGarment(embroidery);
  const sizeSummary = SIZES.filter((s) => sizes[s] > 0).map((s) => `${s} x ${sizes[s]}`).join(", ");
  const localCitiesLabel = `${LOCAL_CITIES.slice(0, -1).join(", ")}, and ${LOCAL_CITIES[LOCAL_CITIES.length - 1]}`;

  const disabled = stage === "pay";

  return (
    <>
      {/* Hero */}
      <section className="border-b border-black/5 bg-[#f6f6f4]">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            The Everyday Work Polo
          </h1>
          <p className="mt-3 text-base font-semibold text-[#13294b]">
            100% Polyester, embroidered with your logo.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Clean, comfortable polos your whole crew can wear every day. Buy The Everyday Work Polo,
            a 100% polyester polo with your logo embroidered on for just ${EVERYDAY_POLO_UNIT_PRICE} each,
            or bring your own garments and we will embroider them for you. Free local pickup and
            delivery in the {localCitiesLabel} area.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <span className="text-[#f0b100]">★★★★★</span>
            <span>5.0 average rating, trusted by local businesses.</span>
          </div>
        </div>
      </section>

      {/* Configurator + summary */}
      <section className="bg-[#ececeb] py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-[1.7fr_1fr]">
          {/* ── Left: configuration ── */}
          <div className={`space-y-8 ${disabled ? "pointer-events-none opacity-60" : ""}`}>
            {/* 1. Locality — chosen first, gates the options below */}
            <Card>
              <Label>Are you local to our area?</Label>
              <p className="mb-3 text-sm leading-6 text-gray-600">
                We offer free pickup and delivery in {localCitiesLabel}, TX. Outside that area we ship
                your order to you.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ChoiceButton
                  selected={isLocal === true}
                  onClick={() => setIsLocal(true)}
                  title="I'm local"
                  subtitle="Free pickup and delivery in our area"
                />
                <ChoiceButton
                  selected={isLocal === false}
                  onClick={() => {
                    setIsLocal(false);
                    setSource("buy");
                    setSelectedRate(null);
                  }}
                  title="I'm outside the area"
                  subtitle="Ship it to me with live rates"
                />
              </div>
            </Card>

            {/* 2. Garment source — supply is local-only */}
            <Card>
              <Label>Are you buying polos or bringing your own?</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ChoiceButton
                  selected={source === "buy"}
                  onClick={() => setSource("buy")}
                  title="Buy The Everyday Work Polo"
                  subtitle={`$${EVERYDAY_POLO_UNIT_PRICE} each with your logo`}
                />
                {isLocal === true && (
                  <ChoiceButton
                    selected={source === "supply"}
                    onClick={() => setSource("supply")}
                    title="I'll provide my own garments"
                    subtitle={`Logo from $${SUPPLIED_RATE_MANY} per garment`}
                  />
                )}
              </div>
              {isLocal !== true && (
                <p className="mt-3 text-xs leading-5 text-gray-500">
                  Bringing your own garments is available for local pickup and delivery only. Select
                  &quot;I&apos;m local&quot; above to unlock it.
                </p>
              )}
            </Card>

            {/* 2a. Buy path */}
            {source === "buy" && (
              <Card>
                <Label>Polo Style</Label>
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {(["Men's", "Women's"] as PoloGender[]).map((g) => (
                    <ChoiceButton
                      key={g}
                      selected={gender === g}
                      onClick={() => setGender(g)}
                      title={`${g} Polos`}
                      subtitle="100% Polyester"
                    />
                  ))}
                </div>

                <ProductPreview
                  src={currentColor.front}
                  alt={`${gender} Everyday Work Polo in ${color}`}
                  fallbackHex={currentColor.hex}
                  fallbackEmoji="👔"
                  label={`${gender} Everyday Work Polo in ${color}`}
                  colorPickerSlot={
                    <ColorPicker
                      colors={COLORS.map((c) => ({ name: c.name, hex: c.hex, image: c.front }))}
                      selectedColor={color}
                      onSelect={setColor}
                    />
                  }
                />

                <div className="mt-6">
                  <Label>Size Breakdown</Label>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {SIZES.map((size) => (
                      <div key={size} className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-gray-600">{size}</span>
                        <input
                          type="number"
                          min={0}
                          value={sizes[size] || ""}
                          placeholder="0"
                          onChange={(e) =>
                            setSizes((prev) => ({ ...prev, [size]: Math.max(0, Number(e.target.value) || 0) }))
                          }
                          className="w-full rounded-xl border border-black/10 bg-white px-1 py-2 text-center text-sm outline-none focus:border-[#e3b33d]"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Optional, helps us plan your run. Your total is based on the quantity below.
                  </p>
                </div>

                <div className="mt-6 max-w-xs">
                  <Label>How many polos?</Label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={buyQtyStr}
                    onChange={(e) => setBuyQtyStr(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="e.g. 12"
                    className="w-full rounded-2xl border border-[#e3b33d] bg-white px-4 py-3 text-sm font-medium outline-none"
                  />
                  {sizeSummary && <p className="mt-2 text-xs text-gray-500">Sizes entered: {sizeSummary}</p>}
                </div>
              </Card>
            )}

            {/* 2b. Supply path */}
            {source === "supply" && (
              <Card>
                <Label>Your Garments</Label>
                <p className="mb-4 text-sm leading-6 text-gray-600">
                  List each garment you will bring. The logo is{" "}
                  <span className="font-semibold">${SUPPLIED_RATE_FEW} per garment</span> for 2 or fewer, or{" "}
                  <span className="font-semibold">${SUPPLIED_RATE_MANY} per garment</span> at 3 or more.
                </p>

                <div className="space-y-4">
                  {garments.map((g, idx) => (
                    <div key={idx} className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-bold">Garment {idx + 1}</span>
                        {garments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGarmentRow(idx)}
                            className="text-xs font-semibold text-red-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Field label="Qty">
                          <input
                            type="number"
                            min={1}
                            value={g.quantity || ""}
                            onChange={(e) =>
                              updateGarment(idx, { quantity: Math.max(1, Number(e.target.value) || 1) })
                            }
                            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#e3b33d]"
                          />
                        </Field>
                        <Field label="Brand">
                          <input
                            value={g.brand}
                            onChange={(e) => updateGarment(idx, { brand: e.target.value.slice(0, 40) })}
                            placeholder="e.g. Nike"
                            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#e3b33d]"
                          />
                        </Field>
                        <Field label="Color">
                          <input
                            value={g.color}
                            onChange={(e) => updateGarment(idx, { color: e.target.value.slice(0, 40) })}
                            placeholder="e.g. Navy"
                            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#e3b33d]"
                          />
                        </Field>
                        <Field label="Style">
                          <input
                            value={g.style}
                            onChange={(e) => updateGarment(idx, { style: e.target.value.slice(0, 40) })}
                            placeholder="Polo, Hoodie"
                            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#e3b33d]"
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addGarmentRow}
                  className="mt-4 rounded-xl border border-[#13294b] px-4 py-2 text-sm font-semibold text-[#13294b] transition hover:bg-[#eef2f7]"
                >
                  + Add another garment
                </button>
              </Card>
            )}

            {/* 3. Embroidery placements */}
            <Card>
              <Label>Where should your logo go?</Label>
              <p className="mb-3 text-sm leading-6 text-gray-600">
                Your price includes one logo at the placement you choose. Each additional placement
                adds ${EXTRA_LOGO_PRICE} per garment.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {PLACEMENTS.map((p) => (
                  <PlacementButton
                    key={p}
                    label={p}
                    selected={placements.includes(p)}
                    onClick={() => togglePlacement(p)}
                  />
                ))}
              </div>

              {placements.includes("Back") && (
                <div className="mt-4 max-w-xs">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Back logo size</label>
                  <select
                    value={backSizeIn}
                    onChange={(e) => setBackSizeIn(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#e3b33d] bg-white px-4 py-3 text-sm font-medium outline-none"
                  >
                    {BACK_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s} inch{s > BACK_BASE_SIZE_IN ? ` (add $${BACK_OVERSIZE_PRICE} per garment)` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Up to {BACK_BASE_SIZE_IN} inches included. Larger adds ${BACK_OVERSIZE_PRICE} per garment.
                  </p>
                </div>
              )}
            </Card>

            {/* 4. Artwork — one upload per selected placement */}
            <Card>
              <Label>Your Logo Artwork (optional)</Label>
              <p className="mb-4 text-sm leading-6 text-gray-600">
                Upload a logo file for each placement you selected, or skip this and we will request
                it after you order.
              </p>
              <div className="space-y-4">
                {placements.map((p) => (
                  <ArtworkUpload
                    key={p}
                    title={`${p} Logo`}
                    subtitle={`Upload the logo for the ${p.toLowerCase()} placement.`}
                    buttonLabel="Upload logo"
                    helpText="PNG, JPG, PDF, AI, SVG up to 10 MB"
                    onUploaded={(url) => setArt(p, url)}
                  />
                ))}
              </div>
              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">Notes or instructions (optional)</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="h-24 w-full rounded-2xl border border-[#e3b33d] bg-white p-4 text-sm outline-none"
                  placeholder="Thread colors, logo notes, deadlines, and so on."
                />
              </div>
            </Card>

            {/* 6. Address — based on the locality choice made at the top */}
            <Card>
              <Label>{isLocal === false ? "Shipping Address" : "Pickup / Delivery Address"}</Label>

              {isLocal === null && (
                <p className="text-sm text-gray-600">
                  Choose whether you are local at the top of the page to continue.
                </p>
              )}

              {isLocal === true && (
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-gray-600">
                    Enter your address so we can schedule your free pickup or delivery. Available in{" "}
                    {localCitiesLabel}, TX.
                  </p>
                  <AddressFields addr={addr} setAddr={setAddr} />
                  {addressFilled && !localIsValid && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                      Sorry, {addr.city ? `${addr.city}, ${addr.state.toUpperCase()}` : "that address"} is
                      outside our free local pickup and delivery area. Please select &quot;I&apos;m outside
                      the area&quot; at the top to ship it instead.
                    </p>
                  )}
                </div>
              )}

              {isLocal === false && (
                <div className="space-y-4">
                  <AddressFields addr={addr} setAddr={setAddr} />
                  <button
                    type="button"
                    onClick={fetchRates}
                    disabled={ratesLoading || !addressFilled}
                    className="rounded-xl bg-[#13294b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f1f39] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {ratesLoading ? "Loading rates..." : "Get shipping options"}
                  </button>
                  {ratesError && <p className="text-sm text-red-500">{ratesError}</p>}
                  {rates.length > 0 && (
                    <div className="space-y-3">
                      {rates.map((m) => {
                        const sel = selectedRate?.id === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedRate(m)}
                            className={`block w-full rounded-xl border px-4 py-4 text-left transition ${
                              sel ? "border-[#e3b33d] bg-[#fff8e7]" : "border-black/10 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{m.label}</span>
                              <span className="font-semibold">
                                {m.price === 0 ? "Free" : `$${m.price.toFixed(2)}`}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{m.eta}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* 6. Contact */}
            <Card>
              <Label>Your Contact Info</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#e3b33d]"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#e3b33d]"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#e3b33d]"
                    />
                  </Field>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Right: live summary ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold">Order Summary</p>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <SummaryRow label="Path" value={source === "buy" ? "Buy polos" : "My garments"} />
                {source === "buy" && <SummaryRow label="Style" value={`${gender} Everyday Work Polo`} />}
                {source === "buy" && <SummaryRow label="Material" value="100% Polyester" />}
                {source === "buy" && <SummaryRow label="Color" value={color} />}
                <SummaryRow label="Garments" value={String(garmentCount)} />
                {garmentCount > 0 && (
                  <SummaryRow label="Base per garment" value={`$${baseRate.toFixed(2)}`} />
                )}
                {addOns > 0 && <SummaryRow label="Add-ons per garment" value={`+$${addOns.toFixed(2)}`} />}
                <SummaryRow label="Logos" value={placements.join(", ")} />
                {backOversizeApplies(embroidery) && (
                  <SummaryRow label="Back size" value={`${backSizeIn} inch (+$${BACK_OVERSIZE_PRICE})`} />
                )}
              </div>

              <div className="mt-5 space-y-2 border-t border-black/5 pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{fulfillment ? fulfillment.method : "Pickup, delivery, or shipping"}</span>
                  <span>
                    {fulfillment
                      ? shippingPrice === 0
                        ? "Free"
                        : `$${shippingPrice.toFixed(2)}`
                      : "Selected below"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-3 text-lg font-extrabold">
                  <span>Total</span>
                  <span>${(stage === "pay" ? serverTotal : grandTotal).toFixed(2)}</span>
                </div>
              </div>

              {configError && garmentCount > 0 && (
                <p className="mt-3 text-xs text-amber-600">{configError}</p>
              )}

              {stage === "configure" ? (
                <button
                  type="button"
                  onClick={continueToPayment}
                  disabled={!canCheckout || placing}
                  className={`mt-5 w-full rounded-2xl px-6 py-4 text-sm font-bold text-white transition ${
                    !canCheckout || placing
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-[#13294b] hover:bg-[#0f1f39]"
                  }`}
                >
                  {placing ? "Preparing..." : "Continue to Secure Payment"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={editOrder}
                  className="mt-5 w-full rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-bold transition hover:bg-gray-50"
                >
                  Edit order
                </button>
              )}

              {!canCheckout && stage === "configure" && (
                <p className="mt-3 text-center text-xs text-gray-400">
                  Complete your garments, fulfillment, and contact info to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Payment */}
      {stage === "pay" && (
        <section id="promo-payment" className="bg-white py-12">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-2xl font-extrabold">Secure Payment</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              We stitch only after you approve a proof. You will get a design proof by email before
              anything goes into production.
            </p>

            <div className="mt-6 rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
              <StripePaymentForm
                key={Math.round(serverTotal * 100)}
                ref={stripeRef}
                amount={serverTotal}
              />

              <button
                type="button"
                onClick={placeOrder}
                disabled={placing}
                className="mt-5 w-full rounded-xl bg-[#13294b] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#0f1f39] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placing ? "Processing..." : `Place Order, $${serverTotal.toFixed(2)}`}
              </button>

              {checkoutError && <p className="mt-4 text-sm text-red-500">{checkoutError}</p>}

              <p className="mt-4 text-xs leading-5 text-gray-400">
                Payment is securely processed by Stripe. By placing your order you agree to our{" "}
                <a href="/terms" className="underline">Terms</a> and{" "}
                <a href="/privacy" className="underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// ─── Small presentational helpers ─────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm sm:p-6">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold text-black">{label}:</span> {value}
    </p>
  );
}

function ChoiceButton({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-left transition ${
        selected ? "border-[#e3b33d] bg-[#fff8e7] shadow-sm" : "border-black/10 bg-white hover:border-[#d9d9d9]"
      }`}
    >
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </button>
  );
}

function AddressFields({
  addr,
  setAddr,
}: {
  addr: { line1: string; line2: string; city: string; state: string; zip: string };
  setAddr: React.Dispatch<
    React.SetStateAction<{ line1: string; line2: string; city: string; state: string; zip: string }>
  >;
}) {
  return (
    <div className="space-y-3">
      <Field label="Street address">
        <input
          value={addr.line1}
          onChange={(e) => setAddr((p) => ({ ...p, line1: e.target.value }))}
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#e3b33d]"
        />
      </Field>
      <Field label="Apt or Suite (optional)">
        <input
          value={addr.line2}
          onChange={(e) => setAddr((p) => ({ ...p, line2: e.target.value }))}
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#e3b33d]"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2">
          <Field label="City">
            <input
              value={addr.city}
              onChange={(e) => setAddr((p) => ({ ...p, city: e.target.value }))}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#e3b33d]"
            />
          </Field>
        </div>
        <Field label="State">
          <input
            value={addr.state}
            onChange={(e) => setAddr((p) => ({ ...p, state: e.target.value.toUpperCase().slice(0, 2) }))}
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#e3b33d]"
          />
        </Field>
        <Field label="ZIP">
          <input
            value={addr.zip}
            onChange={(e) => setAddr((p) => ({ ...p, zip: e.target.value.replace(/[^\d-]/g, "").slice(0, 10) }))}
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#e3b33d]"
          />
        </Field>
      </div>
    </div>
  );
}
