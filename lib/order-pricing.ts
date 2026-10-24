import type { CartItem } from "@/types/cart";
import { getUnitPrice } from "@/lib/products/pricing";
import { MAX_QUANTITY, parseAddOns, quoteOrder } from "@/lib/pricing";

/**
 * The one place a cart line's price is decided.
 *
 * The product pages show prices, but the amount a customer is charged is
 * whatever this returns, computed on the server from what was ordered (product,
 * quantity, placements, options) and never from a price the browser sent.
 * Before this, the browser told the server what to charge, so editing one
 * number in the page could buy a $150 order for $1.
 *
 * The cart uses the same function, so what the customer sees is what the
 * server will charge.
 */

/** Polos with both a left chest logo and a right side name. */
export const POLO_DUAL_PLACEMENT_PER_PIECE = 5;

/** Hoodies and sweaters: the base price covers one 3.5" logo; $5 per extra inch. */
export const LOGO_BASE_WIDTH_IN = 3.5;
export const LOGO_PRICE_PER_INCH = 5;
export const LOGO_MAX_WIDTH_IN = 9;

/** The New Hire bundle is a flat price per bundle. */
export const NEW_HIRE_PRICE = 115;

/** Guards against absurd quantities typed (or forged) into an order. */
const MAX_LINE_QUANTITY = 5000;

export type PricedLine = {
  unitPrice: number;
  perPieceUpcharge: number;
  flatUpcharge: number;
  price: number;
};

type PriceableItem = Pick<
  CartItem,
  "productType" | "quantity" | "placement" | "details" | "styleId" | "addOns"
>;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Hoodie and sweater logo charge: a second placement, plus any extra width. */
function logoUpcharge(item: PriceableItem): number | { error: string } {
  const chest = item.placement.includes("Chest Logo");
  const back  = item.placement.includes("Back Logo");
  if (!chest && !back) return { error: `${item.productType}: choose at least one logo placement.` };

  const width = (key: string): number | null => {
    const raw = item.details[key];
    if (raw === undefined || raw === "") return LOGO_BASE_WIDTH_IN;
    const n = Number(raw);
    return Number.isFinite(n) && n >= LOGO_BASE_WIDTH_IN && n <= LOGO_MAX_WIDTH_IN ? n : null;
  };
  const chestWidth = width("Chest Logo Width");
  const backWidth  = width("Back Logo Width");
  if (chestWidth === null || backWidth === null) {
    return { error: `${item.productType}: logo width is out of range.` };
  }

  const secondPlacement = chest && back ? LOGO_BASE_WIDTH_IN * LOGO_PRICE_PER_INCH : 0;
  const chestExtra = chest ? (chestWidth - LOGO_BASE_WIDTH_IN) * LOGO_PRICE_PER_INCH : 0;
  const backExtra  = back  ? (backWidth  - LOGO_BASE_WIDTH_IN) * LOGO_PRICE_PER_INCH : 0;
  return round2(secondPlacement + chestExtra + backExtra);
}

export function priceCartItem(item: PriceableItem): PricedLine | { error: string } {
  const qty = item.quantity;
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_LINE_QUANTITY) {
    return { error: `${item.productType}: invalid quantity.` };
  }
  const placement = Array.isArray(item.placement) ? item.placement : [];
  const details   = item.details && typeof item.details === "object" ? item.details : {};
  const line = { ...item, placement, details };

  switch (item.productType) {
    case "Custom Hats": {
      if (!item.styleId) {
        return { error: "A hat in your cart is out of date. Please remove it and add it again." };
      }
      if (qty > MAX_QUANTITY) return { error: `Custom Hats: the most we take online is ${MAX_QUANTITY}.` };
      try {
        const quote = quoteOrder({
          styleId:    item.styleId,
          quantity:   qty,
          placements: parseAddOns(item.addOns),
          // The cart has no puff flag of its own; the stitch type detail is it.
          puff:       (details["Stitch Type"] ?? "").includes("3D Puff"),
        });
        return { unitPrice: quote.perHat, perPieceUpcharge: 0, flatUpcharge: 0, price: quote.subtotal };
      } catch {
        return { error: "A hat in your cart is no longer available. Please remove it and add it again." };
      }
    }

    case "Custom Polos": {
      const dual = placement.includes("Left Chest Logo") && placement.includes("Right Side Name");
      const perPiece = dual ? POLO_DUAL_PLACEMENT_PER_PIECE : 0;
      const unit = getUnitPrice("Custom Polos", qty) + perPiece;
      return { unitPrice: unit, perPieceUpcharge: perPiece, flatUpcharge: 0, price: round2(unit * qty) };
    }

    case "Custom Hoodies":
    case "Custom Sweaters": {
      const flat = logoUpcharge(line);
      if (typeof flat !== "number") return flat;
      const unit = getUnitPrice(item.productType, qty);
      return { unitPrice: unit, perPieceUpcharge: 0, flatUpcharge: flat, price: round2(unit * qty + flat) };
    }

    case "The New Hire":
      return { unitPrice: NEW_HIRE_PRICE, perPieceUpcharge: 0, flatUpcharge: 0, price: NEW_HIRE_PRICE * qty };

    default: {
      // Shirt printing (every fabric/sleeve combination) and safety vests are
      // plain tier tables. Anything not in a table prices at 0 and is refused,
      // so an invented product type cannot ride through for free.
      const unit = getUnitPrice(item.productType, qty);
      if (unit <= 0) return { error: `"${item.productType}" can't be ordered online.` };
      return { unitPrice: unit, perPieceUpcharge: 0, flatUpcharge: 0, price: round2(unit * qty) };
    }
  }
}

/** Prices a whole cart, or returns the first problem found. */
export function priceCart(
  items: PriceableItem[]
): { lines: PricedLine[]; subtotal: number } | { error: string } {
  if (!Array.isArray(items) || items.length === 0) return { error: "Your cart is empty." };
  const lines: PricedLine[] = [];
  for (const item of items) {
    const priced = priceCartItem(item);
    if ("error" in priced) return priced;
    lines.push(priced);
  }
  return { lines, subtotal: round2(lines.reduce((s, l) => s + l.price, 0)) };
}
