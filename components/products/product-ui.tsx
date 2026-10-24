"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";

// ─── Label ────────────────────────────────────────────────────

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-base font-bold text-black">{children}</p>
  );
}

// ─── Placement Button ─────────────────────────────────────────

export function PlacementButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
        selected
          ? "border-[#e3b33d] bg-[#fff8e7] shadow-sm"
          : "border-black/10 bg-white hover:border-[#d9d9d9]"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Feature Card ─────────────────────────────────────────────

export function Feature({
  image,
  title,
  text,
}: {
  image: string;
  title: string;
  text: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center">
        <Image src={image} alt={title} width={96} height={96} className="object-contain" />
      </div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────

export function ReviewCard({
  initials,
  title,
  date,
  text,
}: {
  initials: string;
  title: string;
  date: string;
  text: string;
}) {
  return (
    <div className="border-t border-black/10 py-8 first:border-t-0 first:pt-0">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffd84d] text-sm font-bold text-black">
          {initials}
        </div>
        <div className="flex-1">
          <div className="text-[#f0b100]">★★★★★</div>
          <h3 className="mt-1 text-lg font-bold">{title}</h3>
          <p className="text-xs text-gray-500">Verified · {date}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Color Picker ─────────────────────────────────────────────

export function ColorPicker({
  colors,
  selectedColor,
  onSelect,
}: {
  colors: { name: string; hex: string; image: string }[];
  selectedColor: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-sm">
      <p className="mb-4 text-sm font-medium text-gray-600">
        Color:{" "}
        <span className="font-bold text-black">{selectedColor}</span>
      </p>
      {/* Wraps rather than a fixed grid: inline in a narrow column, a fixed
          six-across grid of 48px swatches overflowed and overlapped. */}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onSelect(color.name)}
            title={color.name}
            aria-pressed={selectedColor === color.name}
            className={`h-10 w-10 shrink-0 rounded-full border-2 transition hover:scale-105 ${
              selectedColor === color.name
                ? "border-[#13294b] ring-2 ring-[#13294b]/20"
                : "border-white shadow"
            }`}
            style={{ backgroundColor: color.hex }}
          >
            <span className="sr-only">{color.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Product Preview (color-reactive mockup, optional front/back modal) ──────

export function ProductPreview({
  src,
  backSrc,
  alt,
  fallbackHex,
  fallbackEmoji,
  label,
  colorPickerSlot,
}: {
  src: string;
  backSrc?: string;
  alt: string;
  fallbackHex: string;
  fallbackEmoji: string;
  label: string;
  colorPickerSlot?: ReactNode;
}) {
  const [imgError, setImgError]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"front" | "back">("front");

  useEffect(() => { setImgError(false); }, [src]);

  // The colour picker sits inline under the photo. It used to live only inside
  // this modal, behind "Tap to pick a color", and customers did not find it.
  // The modal now exists only for products with a back view to show.
  const canExpand = !!backSrc;

  function openModal() {
    if (!canExpand) return;
    setModalView("front");
    setModalOpen(true);
  }

  return (
    <>
      <div className="mt-5 rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-500">Selected Preview</p>

        <button
          type="button"
          onClick={openModal}
          disabled={!canExpand}
          className={`mt-4 block w-full rounded-[1.5rem] bg-white p-2 transition ${
            canExpand ? "cursor-pointer hover:opacity-90" : "cursor-default"
          }`}
        >
          {canExpand && (
            <p className="mb-2 text-center text-sm font-semibold text-[#13294b]">
              Tap to view front &amp; back
            </p>
          )}
          <div className="flex items-center justify-center">
            {!imgError && src ? (
              <div className="relative h-72 w-full">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="object-contain"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div
                className="flex h-40 w-40 items-center justify-center rounded-2xl"
                style={{ backgroundColor: fallbackHex }}
              >
                <span className="text-6xl">{fallbackEmoji}</span>
              </div>
            )}
          </div>
        </button>

        <p className="mt-4 text-center text-sm font-semibold">{label}</p>

        {colorPickerSlot && <div className="mt-4">{colorPickerSlot}</div>}
      </div>

      {/* Front / Back Modal */}
      {modalOpen && canExpand && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-sm flex-col overflow-hidden rounded-t-[2rem] bg-white sm:rounded-[2rem]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <p className="text-sm font-bold">{label}</p>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-sm font-bold hover:bg-black/20"
              >
                ✕
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-5 pb-2">
              {backSrc && (
                <div className="flex gap-2">
                  {(["front", "back"] as const).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setModalView(view)}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize transition ${
                        modalView === view
                          ? "bg-[#13294b] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-center rounded-[1.5rem] bg-white p-2">
                <div className="relative h-60 sm:h-80 w-full">
                  <Image
                    src={backSrc && modalView === "back" ? backSrc : src}
                    alt={`${alt}${backSrc ? ` ${modalView}` : ""}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
              </div>

            </div>

            {/* Fixed confirm button */}
            <div className="px-5 pt-3 pb-5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full rounded-2xl bg-[#13294b] py-3 text-sm font-bold text-white transition hover:bg-[#0f1f39]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Quantity Selector ────────────────────────────────────────

export type QuantityOption = { label: string; qty: number; price: number };

export function QuantitySelector({
  quantities,
  selectedQuantity,
  isCustomQuantity,
  customQuantity,
  customQuantityError,
  customQtyIsValid,
  total,
  perUnit,
  upcharge = 0,
  perPieceUpcharge = 0,
  onPresetSelect,
  onCustomChange,
  onCustomFocus,
}: {
  quantities: QuantityOption[];
  selectedQuantity: string;
  isCustomQuantity: boolean;
  customQuantity: string;
  customQuantityError: string;
  customQtyIsValid: boolean;
  total: number;
  perUnit: number;
  upcharge?: number;         // flat per-order fee (hoodies logo size)
  perPieceUpcharge?: number; // per-piece fee (polos dual placement)
  onPresetSelect: (label: string) => void;
  onCustomChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCustomFocus: () => void;
}) {
  // The single-piece rate is the yardstick for "save X%". Measured on the base
  // price only, so an upcharge the customer chose does not inflate the saving.
  const baseEach = quantities.length ? quantities[0].price / quantities[0].qty : 0;

  return (
    <div className="space-y-3">
      {quantities.map((q) => {
        const each   = q.price / q.qty;
        const saving = baseEach > 0 ? Math.round((1 - each / baseEach) * 100) : 0;
        return (
          <button
            key={q.label}
            type="button"
            onClick={() => onPresetSelect(q.label)}
            aria-pressed={!isCustomQuantity && selectedQuantity === q.label}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
              !isCustomQuantity && selectedQuantity === q.label
                ? "border-[#e3b33d] bg-[#fff8e7] shadow-sm"
                : "border-black/10 bg-white hover:border-[#d9d9d9]"
            }`}
          >
            <span>
              {q.label}
              <span className="block text-xs font-normal text-gray-500">
                ${(each + perPieceUpcharge).toFixed(2)} each
              </span>
            </span>
            <span className="text-right">
              ${(q.price + upcharge + q.qty * perPieceUpcharge).toFixed(2)}
              {saving > 0 && (
                <span className="mt-0.5 block rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
                  Save {saving}%
                </span>
              )}
            </span>
          </button>
        );
      })}

      <div
        className={`rounded-2xl border px-4 py-4 transition ${
          isCustomQuantity
            ? "border-[#e3b33d] bg-white shadow-sm"
            : "border-black/10 bg-white"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCustomFocus}
            className="text-left text-sm font-semibold"
          >
            Custom quantity
          </button>
          <div className="flex items-center gap-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={isCustomQuantity ? customQuantity : ""}
              onChange={onCustomChange}
              onFocus={onCustomFocus}
              placeholder="Custom Quantity"
              className="w-32 sm:w-40 rounded-2xl border border-[#e3b33d] px-4 py-3 text-center text-sm font-medium outline-none"
            />
            {isCustomQuantity && customQtyIsValid && (
              <div className="min-w-[92px] text-right">
                <p className="text-xl font-bold">${total.toFixed(2)}</p>
                <p className="text-xs text-gray-500">${perUnit.toFixed(2)} each</p>
              </div>
            )}
          </div>
        </div>
        {isCustomQuantity && customQuantityError && (
          <p className="mt-3 text-sm text-red-500">{customQuantityError}</p>
        )}
      </div>

      {perPieceUpcharge > 0 && (
        <p className="text-xs text-[#d39a14]">
          ★ Dual placement adds ${perPieceUpcharge.toFixed(2)}/piece
        </p>
      )}
      {upcharge > 0 && (
        <p className="text-xs text-[#d39a14]">
          ★ Logo size upcharge of ${upcharge.toFixed(2)} included
        </p>
      )}
    </div>
  );
}

// ─── Price Summary + CTA ──────────────────────────────────────

export function PriceSummary({
  total,
  perUnit,
  unit,
  isValid,
  onSubmit,
  summaryItems,
}: {
  total: number;
  perUnit: number;
  unit: string;
  isValid: boolean;
  onSubmit: () => void;
  summaryItems: { label: string; value: string }[];
}) {
  return (
    <div>
      <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 text-center shadow-sm">
        <p className="text-4xl font-extrabold">
          {isValid ? `$${total.toFixed(2)}` : "—"}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          {isValid ? `$${perUnit.toFixed(2)} / ${unit}` : "—"}
        </p>
      </div>

      <StickyOrderBar
        watchId="product-continue"
        total={isValid ? total : null}
        caption={isValid ? `$${perUnit.toFixed(2)} / ${unit}` : "Finish your selection"}
        disabled={!isValid}
        onSubmit={onSubmit}
      />

      <button
        id="product-continue"
        type="button"
        onClick={onSubmit}
        disabled={!isValid}
        className={`mt-5 w-full rounded-2xl px-6 py-4 text-sm font-bold text-white transition ${
          !isValid
            ? "cursor-not-allowed bg-gray-400"
            : "bg-[#13294b] hover:scale-[1.02] hover:bg-[#0f1f39]"
        }`}
      >
        Continue to Upload
      </button>

      <div className="mt-5 rounded-[1.5rem] border border-black/10 bg-white p-5 text-left shadow-sm">
        <p className="text-sm font-bold">Your Selection</p>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {summaryItems.map((item) => (
            <p key={item.label}>
              <span className="font-semibold text-black">{item.label}:</span>{" "}
              {item.value}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sticky Order Bar (phones) ────────────────────────────────

/**
 * Price and Continue pinned to the bottom of the screen on phones.
 *
 * On a phone the configurator stacks into one long column and the real
 * Continue button ends up several screens down. The bar shows only while that
 * button (found by `watchId`) is still below the viewport, so it never sits on
 * top of the button itself or covers the footer once the customer has
 * scrolled past it.
 */
export function StickyOrderBar({
  watchId,
  total,
  caption,
  disabled = false,
  onSubmit,
  label = "Continue",
}: {
  watchId: string;
  /** Null shows a dash, for when the selection is not yet orderable. */
  total: number | null;
  caption: string;
  disabled?: boolean;
  onSubmit: () => void;
  label?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShow(!entry.isIntersecting && entry.boundingClientRect.top > 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchId]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <div>
          <p className="text-xl font-extrabold leading-none">
            {total === null ? "—" : `$${total.toFixed(2)}`}
          </p>
          <p className="mt-1 text-xs text-gray-500">{caption}</p>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className={`rounded-2xl px-6 py-3 text-sm font-bold text-white transition ${
            disabled ? "cursor-not-allowed bg-gray-400" : "bg-[#13294b] hover:bg-[#0f1f39]"
          }`}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

// ─── Size Breakdown ───────────────────────────────────────────

/** Sum of a size breakdown, ignoring blanks and negatives. */
export function sizeBreakdownTotal(
  sizes: string[],
  breakdown: Record<string, number>
): number {
  return sizes.reduce((sum, s) => sum + (breakdown[s] || 0), 0);
}

/**
 * Whether a breakdown may be submitted alongside `orderQty`.
 *
 * Blank is allowed: sizes are optional and can be sent with the artwork. What
 * is not allowed is a breakdown that contradicts the order, which is what this
 * exists to stop. Before it, a customer could order one polo and specify five
 * smalls, and the shop received both numbers with no way to tell which was
 * meant.
 */
export function sizeBreakdownIsValid(total: number, orderQty: number): boolean {
  return total === 0 || total === orderQty;
}

export function SizeBreakdown({
  sizes,
  breakdown,
  orderQty,
  onChange,
  unit = "piece",
}: {
  sizes: string[];
  breakdown: Record<string, number>;
  /** The quantity actually being ordered, which the breakdown must match. */
  orderQty: number;
  onChange: (next: Record<string, number>) => void;
  unit?: string;
}) {
  const total = sizeBreakdownTotal(sizes, breakdown);
  const ok = sizeBreakdownIsValid(total, orderQty);

  return (
    <div>
      <Label>Sizes</Label>
      <p className="mb-2 text-xs text-gray-500">
        Enter how many of each size and we&apos;ll set your quantity for you. Not
        sure yet? Skip this, pick a quantity, and send sizes later.
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-gray-600">{size}</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              aria-label={`Quantity of size ${size}`}
              value={breakdown[size] || ""}
              placeholder="0"
              onChange={(e) =>
                onChange({
                  ...breakdown,
                  [size]: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className={`w-full rounded-xl border bg-white px-1 py-2 text-center text-sm outline-none ${
                total > 0 && !ok
                  ? "border-red-400 focus:border-red-500"
                  : "border-black/10 focus:border-[#e3b33d]"
              }`}
            />
          </div>
        ))}
      </div>

      {total > 0 && (
        <p
          role={ok ? undefined : "alert"}
          className={`mt-2 text-xs ${ok ? "text-gray-500" : "font-semibold text-red-600"}`}
        >
          {ok
            ? `${total} ${unit}${total === 1 ? "" : "s"} total. Your quantity is set to match.`
            : `Your sizes add up to ${total}, but the quantity is ${orderQty}. Change a size and the quantity will follow.`}
        </p>
      )}
    </div>
  );
}
