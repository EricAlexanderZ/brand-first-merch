"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProcessSteps } from "@/components/process-steps";
import ArtworkUpload from "@/components/artwork-upload";
import { useCart } from "@/components/cart/cart-provider";

const PRODUCT_EMOJI: Record<string, string> = {
  "Custom Hats":     "🧢",
  "Custom Polos":    "👔",
  "Custom Hoodies":  "🧥",
  "Custom Sweaters": "🧶",
};

const PRODUCT_SLUG: Record<string, string> = {
  "Custom Hats":     "/products/custom-hats",
  "Custom Polos":    "/products/custom-polos",
  "Custom Hoodies":  "/products/custom-hoodies",
  "Custom Sweaters": "/products/custom-sweaters",
};

const STANDARD_KEYS = new Set([
  "productType", "style", "color", "quantity",
  "placement", "total", "perUnit", "minQty", "flatUpcharge", "perPieceUpcharge",
  // Hat requoting plumbing. Read explicitly below and stored on the cart item,
  // so they must not also leak into the visible details list.
  "styleId", "addOns",
]);

function formatDetailKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
}

function getUploadSlot(placement: string) {
  return {
    title:       `${placement} Artwork`,
    subtitle:    `Upload your artwork for the ${placement.toLowerCase()}.`,
    buttonLabel: `Upload ${placement.toLowerCase()} artwork`,
  };
}

// ─── Inner component (uses useSearchParams) ───────────────────

function UploadArtworkContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [artworkUrls,  setArtworkUrls]  = useState<Record<number, string>>({});
  const [instructions, setInstructions] = useState("");

  const productType      = params.get("productType") ?? "Custom Product";
  const style            = params.get("style") ?? "";
  const color            = params.get("color") ?? "";
  const quantity         = params.get("quantity") ?? "1";
  const placement        = params.get("placement") ?? "";
  const total            = Number(params.get("total") ?? 0);
  const perUnit          = Number(params.get("perUnit") ?? 0);
  const minQty           = Math.max(1, Number(params.get("minQty") ?? 1));
  const flatUpcharge     = Number(params.get("flatUpcharge") ?? 0);
  const perPieceUpcharge = Number(params.get("perPieceUpcharge") ?? 0);
  const imageUrl         = sessionStorage.getItem("cartItemImage") ?? "";
  const styleId          = params.get("styleId") ?? undefined;
  const addOns           = params.get("addOns") ?? undefined;

  const placements = placement.split(",").map((p) => p.trim()).filter(Boolean);

  const details: Record<string, string> = {};
  params.forEach((value, key) => {
    if (!STANDARD_KEYS.has(key) && value) {
      details[formatDetailKey(key)] = value;
    }
  });

  const parsedQty = Math.max(1, Number.parseInt(quantity, 10) || 1);
  const backHref  = PRODUCT_SLUG[productType] ?? "/";
  const emoji     = PRODUCT_EMOJI[productType] ?? "📦";

  const summaryRows = [
    { label: "Product",   value: productType },
    { label: "Style",     value: style },
    { label: "Color",     value: color },
    { label: "Placement", value: placements.join(", ") || "—" },
    ...Object.entries(details).map(([k, v]) => ({ label: k, value: v })),
    { label: "Quantity",  value: quantity },
    { label: "Total",     value: `$${total.toFixed(2)}` },
    { label: "Per piece", value: `$${perUnit.toFixed(2)}` },
  ].filter((r) => r.value && r.value !== "—" && r.value !== "$0.00");

  function handleAddToCart() {
    const urls = Object.entries(artworkUrls)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, url]) => url)
      .filter(Boolean);

    const finalDetails = instructions.trim()
      ? { ...details, Instructions: instructions.trim() }
      : details;

    addItem({
      productType,
      style,
      color,
      quantity: parsedQty,
      placement: placements,
      details: finalDetails,
      minQty,
      flatUpcharge,
      perPieceUpcharge,
      price: total,
      unitPrice: perUnit,
      image: imageUrl || emoji,
      artworkUrls: urls,
      styleId,
      addOns,
    });
    sessionStorage.removeItem("cartItemImage");
    router.push("/cart");
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Upload Your Artwork</h1>
        <p className="mt-3 text-base text-gray-600">
          Free artwork setup. Online proof. We stitch only after you approve.
        </p>
      </div>

      <div className="mt-8 rounded-[2rem] bg-[#f3f3f2] p-4 shadow-sm sm:p-8">
        {placements.length === 0 ? (
          <ArtworkUpload
            title="Artwork"
            subtitle="Upload your embroidery artwork file."
            buttonLabel="Upload artwork"
            helpText="Drag & Drop PNG, JPG, PDF, AI files up to 10 MB."
            onUploaded={(url) => setArtworkUrls((prev) => ({ ...prev, 0: url }))}
          />
        ) : (
          placements.map((p, i) => {
            if (p === "Right Side Name") {
              return (
                <div key={p} className={i > 0 ? "mt-6" : ""}>
                  <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
                    <div className="text-center">
                      <p className="text-xl font-bold">Right Side Name</p>
                      <p className="mt-2 text-sm text-gray-500">No artwork file required for this placement.</p>
                    </div>
                    <div className="mt-5 flex items-start gap-4 rounded-2xl bg-[#f0f4ff] border border-[#c7d4f5] p-4">
                      <div className="mt-0.5 text-[#3b5bdb] text-lg">✉</div>
                      <div>
                        <p className="text-sm font-bold text-[#1e3a8a]">Font Selection — We Will Reach Out</p>
                        <p className="mt-1 text-sm leading-6 text-[#3b5bdb]">
                          Once your order is placed, our team will contact you directly to discuss font style, size, and layout for your custom name embroidery. We want to make sure every detail is exactly right before production begins.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const slot = getUploadSlot(p);
            return (
              <div key={p} className={i > 0 ? "mt-6" : ""}>
                <ArtworkUpload
                  title={slot.title}
                  subtitle={slot.subtitle}
                  buttonLabel={slot.buttonLabel}
                  helpText="Drag & Drop PNG, JPG, PDF, AI files up to 10 MB."
                  onUploaded={(url) => setArtworkUrls((prev) => ({ ...prev, [i]: url }))}
                />
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <div className="mx-auto max-w-md">
          <label className="mb-2 block text-center text-sm font-semibold">
            Optional instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="h-28 w-full rounded-2xl border border-[#e3b33d] bg-white p-4 text-sm outline-none"
            placeholder="Add packing notes, delivery instructions, or production reminders"
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold">Order Summary</p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              {summaryRows.map((row) => (
                <p key={row.label}>
                  <span className="font-semibold text-black">{row.label}:</span>{" "}
                  {row.value}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <div className="flex gap-3">
              <Link prefetch={false}
                href={backHref}
                className="flex-1 rounded-xl border border-black/10 bg-white px-5 py-3 text-center text-sm font-semibold transition hover:bg-gray-50 sm:flex-none"
              >
                Back
              </Link>
              <button
                type="button"
                className="flex-1 rounded-xl bg-[#efefef] px-5 py-3 text-sm font-semibold text-gray-600 sm:flex-none"
              >
                Skip artwork
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-[#e5b43d] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-95 sm:w-auto"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page (wraps content in Suspense) ────────────────────────

export default function UploadArtworkPage() {
  return (
    <main className="min-h-dvh bg-[#f6f6f4] text-black">
      <TopBanner />
      <SiteHeader />
      <Suspense fallback={
        <div className="flex min-h-[400px] items-center justify-center text-gray-400">
          Loading…
        </div>
      }>
        <UploadArtworkContent />
      </Suspense>
      <ProcessSteps />
      <SiteFooter />
    </main>
  );
}
