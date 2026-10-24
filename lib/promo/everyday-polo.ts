// ─────────────────────────────────────────────────────────────────────────────
// "The Everyday Work Polo" — Meta-ad promotional landing page
//
// Single source of truth for the promo's configuration shape AND pricing logic.
// Imported by BOTH the client configurator (for live display) and the server
// routes (for authoritative price recomputation), so the two can never drift.
// Never trust client-sent totals — the API routes recompute from the raw config.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Pricing constants ───────────────────────────────────────────────────────

/** Flat promo price per polo when the customer buys through us (left-chest logo included). */
export const EVERYDAY_POLO_UNIT_PRICE = 20;

/** Left-chest embroidery rate when the customer supplies their own garment. */
export const SUPPLIED_RATE_FEW = 15; // 2 or fewer garments
export const SUPPLIED_RATE_MANY = 10; // 3 or more garments
export const SUPPLIED_BULK_THRESHOLD = 3; // garments at/above this get the bulk rate

/** Per-garment add-ons. */
export const EXTRA_LOGO_PRICE = 3; // each additional logo placement beyond the first
export const BACK_OVERSIZE_PRICE = 5; // back logo larger than the base size

/** Back-logo sizing. Base size is free; anything larger adds BACK_OVERSIZE_PRICE. */
export const BACK_BASE_SIZE_IN = 3.5;
export const BACK_SIZE_OPTIONS = [3.5, 4, 4.5, 5, 6, 7, 8] as const;

/** Cities eligible for free local pickup / delivery. */
export const LOCAL_CITIES = ["Palmview", "Mission", "McAllen", "Edinburg", "Pharr"] as const;

/** Product-type labels persisted to the orders table (so admin can tell paths apart). */
export const PRODUCT_TYPE_BUY = "Everyday Work Polo";
export const PRODUCT_TYPE_SUPPLY = "Embroidery (Customer Garment)";

// ─── Types ───────────────────────────────────────────────────────────────────

export type GarmentSource = "buy" | "supply";
export type PoloGender = "Men's" | "Women's";

/**
 * Selectable logo placements. The customer chooses where their logo(s) go —
 * the base price covers the first placement, each additional one adds EXTRA_LOGO_PRICE.
 * "Left Chest" is the sensible default but is not forced (some garments already
 * carry branding there).
 */
export const PLACEMENTS = ["Left Chest", "Right Chest", "Left Sleeve", "Right Sleeve", "Back"] as const;
export type Placement = (typeof PLACEMENTS)[number];

export type EmbroideryConfig = {
  placements: Placement[]; // at least one
  backSizeIn: number; // only meaningful when "Back" is selected
};

export type SuppliedGarment = {
  quantity: number;
  brand: string;
  color: string;
  style: string; // e.g. Polo, Hoodie, Fishing Shirt
};

export type BuyConfig = {
  source: "buy";
  gender: PoloGender;
  color: string;
  sizes: Record<string, number>;
  quantity: number;
  embroidery: EmbroideryConfig;
};

export type SupplyConfig = {
  source: "supply";
  garments: SuppliedGarment[];
  embroidery: EmbroideryConfig;
};

export type PromoConfig = BuyConfig | SupplyConfig;

export type FulfillmentType = "local" | "shipping";

export type PromoAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
};

export type PromoFulfillment = {
  type: FulfillmentType;
  method: string; // human label, e.g. "Local Pickup", "USPS Priority Mail"
  shippingPrice: number;
  address: PromoAddress | null; // pickup needs none; delivery/shipping require one
};

export type PromoCustomer = {
  name: string;
  email: string;
  phone: string;
};

/** Wire format posted by the client to the intent + order routes. */
export type PromoCheckoutRequest = {
  config: PromoConfig;
  fulfillment: PromoFulfillment;
  customer: PromoCustomer;
  trackingSource: string | null;
  artworkUrls: string[];
  artworkPlacements: string[]; // placement label for each artwork URL, same order
  instructions: string;
};

/** Largest shipping charge we'll accept from the client (guards against tampering). */
const MAX_SHIPPING_PRICE = 200;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function isLocalCity(city: string): boolean {
  const c = city.trim().toLowerCase();
  return LOCAL_CITIES.some((name) => name.toLowerCase() === c);
}

export function totalGarmentCount(config: PromoConfig): number {
  if (config.source === "buy") return Math.max(0, Math.floor(config.quantity));
  return config.garments.reduce((sum, g) => sum + Math.max(0, Math.floor(g.quantity)), 0);
}

/**
 * Parcel weight quoted to Shippo. Shared by the page (to show rates) and the
 * server (to charge one), so both get the same quote for the same order.
 */
export function promoWeightOz(config: PromoConfig): number {
  return Math.max(16, totalGarmentCount(config) * 8);
}

/** Left-chest rate for supplied garments, tiered on the total garment count. */
export function suppliedUnitRate(totalGarments: number): number {
  return totalGarments >= SUPPLIED_BULK_THRESHOLD ? SUPPLIED_RATE_MANY : SUPPLIED_RATE_FEW;
}

export function backOversizeApplies(emb: EmbroideryConfig): boolean {
  return emb.placements.includes("Back") && emb.backSizeIn > BACK_BASE_SIZE_IN;
}

/**
 * Per-garment add-on charge. The base price already covers the first logo, so
 * only placements beyond the first are charged, plus any back-logo oversize.
 */
export function addOnsPerGarment(emb: EmbroideryConfig): number {
  const extraLogos = Math.max(0, emb.placements.length - 1) * EXTRA_LOGO_PRICE;
  const oversize = backOversizeApplies(emb) ? BACK_OVERSIZE_PRICE : 0;
  return extraLogos + oversize;
}

/** Base per-garment rate before add-ons (the included left-chest logo). */
export function baseRatePerGarment(config: PromoConfig): number {
  if (config.source === "buy") return EVERYDAY_POLO_UNIT_PRICE;
  return suppliedUnitRate(totalGarmentCount(config));
}

/** Authoritative subtotal for the whole order (before shipping). */
export function computeSubtotal(config: PromoConfig): number {
  const perGarment = baseRatePerGarment(config) + addOnsPerGarment(config.embroidery);
  return round2(perGarment * totalGarmentCount(config));
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Returns an error message if the config is not orderable, else null. */
export function validateConfig(config: PromoConfig): string | null {
  const emb = config.embroidery;

  if (!emb || !Array.isArray(emb.placements) || emb.placements.length === 0) {
    return "Please select at least one logo placement.";
  }
  for (const p of emb.placements) {
    if (!PLACEMENTS.includes(p)) return "Invalid logo placement.";
  }
  if (emb.placements.includes("Back") && emb.backSizeIn < BACK_BASE_SIZE_IN) {
    return "Invalid back logo size.";
  }

  if (config.source === "buy") {
    if (!config.color) return "Please choose a polo color.";
    if (!Number.isInteger(config.quantity) || config.quantity < 1) {
      return "Please enter how many polos you need.";
    }
    return null;
  }

  // supply
  if (!config.garments.length) return "Please add at least one garment.";
  for (const g of config.garments) {
    if (!Number.isInteger(g.quantity) || g.quantity < 1) {
      return "Each garment needs a quantity of at least 1.";
    }
    if (!g.brand.trim() || !g.color.trim() || !g.style.trim()) {
      return "Please fill in the brand, color, and style for every garment.";
    }
  }
  return null;
}

/**
 * Authoritative amount computation used by both the intent and order routes.
 * Recomputes the subtotal from the raw config and validates the shipping charge
 * against the chosen fulfillment type. Returns an error message instead of
 * amounts when anything is off.
 */
export function computeOrderAmounts(
  config: PromoConfig,
  fulfillment: PromoFulfillment
): { subtotal: number; shippingPrice: number; total: number } | { error: string } {
  const configError = validateConfig(config);
  if (configError) return { error: configError };

  const subtotal = computeSubtotal(config);
  if (subtotal <= 0) return { error: "Order total must be greater than zero." };

  const requested = Number(fulfillment.shippingPrice);
  if (!Number.isFinite(requested) || requested < 0 || requested > MAX_SHIPPING_PRICE) {
    return { error: "Invalid shipping amount." };
  }

  // Local pickup/delivery is always free; only outbound shipping may carry a charge.
  const shippingPrice = fulfillment.type === "shipping" ? round2(requested) : 0;

  if (!fulfillment.address) {
    return { error: "An address is required." };
  }

  // Fact-check locality: free local pickup/delivery is limited to our TX service area.
  if (fulfillment.type === "local") {
    const { city, state } = fulfillment.address;
    if (state.trim().toUpperCase() !== "TX" || !isLocalCity(city)) {
      return { error: "That address is outside our local pickup & delivery area." };
    }
  }

  return { subtotal, shippingPrice, total: round2(subtotal + shippingPrice) };
}

// ─── Order line items (for persistence into order_items) ─────────────────────

export type PromoLineItem = {
  product_type: string;
  style: string | null;
  color: string | null;
  quantity: number;
  placement: string[];
  details: Record<string, string>;
  price: number;
  unit_price: number;
  per_piece_upcharge: number;
  flat_upcharge: number;
};

function placementList(emb: EmbroideryConfig): string[] {
  return [...emb.placements];
}

function embroideryDetails(emb: EmbroideryConfig): Record<string, string> {
  const details: Record<string, string> = {};
  if (emb.placements.includes("Back")) details["Back Logo Size"] = `${emb.backSizeIn}"`;
  return details;
}

/**
 * Builds the order_items rows for a config, with authoritative per-row pricing.
 * Buy → a single polo line. Supply → one line per garment row (so each garment's
 * brand/color/style is visible to the embroiderer in the admin panel).
 */
export function buildLineItems(config: PromoConfig): PromoLineItem[] {
  const emb = config.embroidery;
  const addOns = addOnsPerGarment(emb);
  const placement = placementList(emb);
  const embDetails = embroideryDetails(emb);

  if (config.source === "buy") {
    const unitPrice = round2(EVERYDAY_POLO_UNIT_PRICE + addOns);
    const sizes = Object.entries(config.sizes)
      .filter(([, n]) => n > 0)
      .map(([size, n]) => `${size}×${n}`)
      .join(", ");

    const details: Record<string, string> = {
      Gender: config.gender,
      Material: "100% Polyester",
      ...embDetails,
    };
    if (sizes) details["Sizes"] = sizes;

    return [
      {
        product_type: PRODUCT_TYPE_BUY,
        style: `${config.gender} Everyday Work Polo`,
        color: config.color,
        quantity: config.quantity,
        placement,
        details,
        price: round2(unitPrice * config.quantity),
        unit_price: unitPrice,
        per_piece_upcharge: addOns,
        flat_upcharge: 0,
      },
    ];
  }

  const rate = suppliedUnitRate(totalGarmentCount(config));
  const unitPrice = round2(rate + addOns);

  return config.garments.map((g) => ({
    product_type: PRODUCT_TYPE_SUPPLY,
    style: g.style,
    color: g.color,
    quantity: g.quantity,
    placement,
    details: { Brand: g.brand, Garment: g.style, ...embDetails },
    price: round2(unitPrice * g.quantity),
    unit_price: unitPrice,
    per_piece_upcharge: addOns,
    flat_upcharge: 0,
  }));
}
