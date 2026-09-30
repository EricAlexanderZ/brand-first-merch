// Single source of truth for per-product pricing tiers and minimum order quantities.
// Used by both product pages (configurator) and the cart (quantity updates).

export type PricingTier = { minQty: number; unitPrice: number };

const TIERS: Record<string, PricingTier[]> = {
  "Custom Hats": [
    { minQty: 100, unitPrice: 13.5  },
    { minQty: 72,  unitPrice: 14    },
    { minQty: 48,  unitPrice: 15    },
    { minQty: 24,  unitPrice: 16    },
    { minQty: 12,  unitPrice: 18    },
    { minQty: 5,   unitPrice: 23    },
  ],
  "Custom Polos": [
    { minQty: 100, unitPrice: 17    },
    { minQty: 72,  unitPrice: 17.5  },
    { minQty: 48,  unitPrice: 18.75 },
    { minQty: 24,  unitPrice: 20    },
    { minQty: 12,  unitPrice: 21    },
    { minQty: 5,   unitPrice: 30    },
  ],
  "Custom Hoodies": [
    { minQty: 48, unitPrice: 31 },
    { minQty: 24, unitPrice: 34 },
    { minQty: 12, unitPrice: 36 },
    { minQty: 5,  unitPrice: 40 },
    { minQty: 1,  unitPrice: 45 },
  ],
  "Custom Sweaters": [
    { minQty: 48, unitPrice: 28 },
    { minQty: 24, unitPrice: 31 },
    { minQty: 12, unitPrice: 33 },
    { minQty: 5,  unitPrice: 35 },
    { minQty: 1,  unitPrice: 40 },
  ],

  /*
   * Shirt printing (DTF). Priced differently from the embroidery lines above:
   * the quoted rate already includes BOTH a front and a back print, so there
   * is no per-placement upcharge to add on top.
   *
   * Eric's tiers, 2026-09-30, given as 1-10 / 11-30 / 30-50 / 50-100 / 101+.
   * Those ranges overlap at 30 and at 50, so the boundary is resolved in the
   * customer's favour: ordering exactly 30 gets the 30-50 rate, exactly 50
   * gets the 50-100 rate. 100 stays in the 50-100 band because 101+ was given
   * explicitly.
   */
  "Shirt Printing (Dri-Fit, Short Sleeve)": [
    { minQty: 101, unitPrice: 10 },
    { minQty: 50,  unitPrice: 13 },
    { minQty: 30,  unitPrice: 15 },
    { minQty: 11,  unitPrice: 18 },
    { minQty: 1,   unitPrice: 20 },
  ],
  "Shirt Printing (Dri-Fit, Long Sleeve)": [
    { minQty: 101, unitPrice: 15 },
    { minQty: 50,  unitPrice: 18 },
    { minQty: 30,  unitPrice: 20 },
    { minQty: 11,  unitPrice: 23 },
    { minQty: 1,   unitPrice: 25 },
  ],
};

/**
 * Cotton (Gildan) is the dri-fit rate less $2 at every tier.
 *
 * Derived rather than typed out, so the two tables cannot drift apart when a
 * dri-fit price is edited and the cotton one is forgotten.
 */
const COTTON_DISCOUNT = 2;
for (const sleeve of ["Short Sleeve", "Long Sleeve"]) {
  TIERS[`Shirt Printing (Cotton, ${sleeve})`] =
    TIERS[`Shirt Printing (Dri-Fit, ${sleeve})`].map((t) => ({
      ...t,
      unitPrice: t.unitPrice - COTTON_DISCOUNT,
    }));
}

/** Fabric and sleeve options for shirt printing, in display order. */
export const SHIRT_FABRICS = ["Dri-Fit", "Cotton"] as const;
export const SHIRT_SLEEVES = ["Short Sleeve", "Long Sleeve"] as const;

export type ShirtFabric = (typeof SHIRT_FABRICS)[number];
export type ShirtSleeve = (typeof SHIRT_SLEEVES)[number];

/**
 * The product-type key for a shirt printing combination.
 *
 * Composed rather than stored, so the cart, the order row and the pricing
 * lookup all name the same thing and a line item reads as what was actually
 * bought.
 */
export function shirtPrintingType(fabric: ShirtFabric, sleeve: ShirtSleeve): string {
  return `Shirt Printing (${fabric}, ${sleeve})`;
}

/**
 * Minimum order quantity, per product type.
 *
 * Everything is 1: single pieces are accepted across the catalog. The tier
 * tables below still start at 5 for hats and polos, which is deliberate — a
 * quantity under the lowest tier falls through to the highest per-piece rate
 * rather than being rejected. Small orders cost more each, they are simply no
 * longer refused.
 */
export const PRODUCT_MOQ: Record<string, number> = {
  "Custom Hats":     1,
  "Custom Polos":    1,
  "Custom Hoodies":  1,
  "Custom Sweaters": 1,
  // Shirt printing keys are composed; every combination accepts a single piece.
  "Shirt Printing (Dri-Fit, Short Sleeve)": 1,
  "Shirt Printing (Dri-Fit, Long Sleeve)":  1,
  "Shirt Printing (Cotton, Short Sleeve)":  1,
  "Shirt Printing (Cotton, Long Sleeve)":   1,
};

/** Returns the unit price for a given product type and quantity. */
export function getUnitPrice(productType: string, qty: number): number {
  const tiers = TIERS[productType];
  if (!tiers) return 0;
  for (const tier of tiers) {
    if (qty >= tier.minQty) return tier.unitPrice;
  }
  return tiers[tiers.length - 1]?.unitPrice ?? 0;
}

/** Returns the minimum order quantity for a product type. */
export function getMinQty(productType: string): number {
  return PRODUCT_MOQ[productType] ?? 1;
}

/** Returns the full pricing tier list for a product type (for displaying tiers in UI). */
export function getPricingTiers(productType: string): PricingTier[] {
  return TIERS[productType] ?? [];
}
