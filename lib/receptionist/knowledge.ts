import { site } from "@/lib/site";
import { getPricingTiers } from "@/lib/products/pricing";
import { CAP_BRANDS, FREE_SHIPPING_QTY, getStylesByBrand, quoteOrder } from "@/lib/pricing";
import { LOCAL_DELIVERY_CITY_LIST } from "@/lib/local-delivery";
import { NEW_HIRE_PRICE, POLO_DUAL_PLACEMENT_PER_PIECE } from "@/lib/order-pricing";

/**
 * What the AI receptionist knows, built from the same sources the site uses.
 *
 * Prices are read from the live pricing tables at the moment the AI asks, so a
 * price change on the site is a price change on the phone, with nothing to
 * update by hand.
 */

/** The products the receptionist can talk about, and where each one is ordered. */
export const RECEPTIONIST_PRODUCTS = {
  hats:          { label: "custom hats",              path: "/products/custom-hats" },
  polos:         { label: "custom polos",             path: "/products/custom-polos" },
  womens_polos:  { label: "women's polos",            path: "/products/custom-polos?fit=womens" },
  shirts:        { label: "printed shirts",           path: "/products/shirt-printing" },
  safety_vests:  { label: "safety vests",             path: "/products/safety-vests" },
  new_hire:      { label: "the New Hire bundle",      path: "/products/new-hire" },
  // Hoodies and sweaters are unlisted while their mockups are redone, so the
  // receptionist points those callers to the contact page instead.
  hoodies:       { label: "hoodies and sweaters",     path: "/contact" },
  other:         { label: "your project",             path: "/contact" },
} as const;

export type ReceptionistProduct = keyof typeof RECEPTIONIST_PRODUCTS;

export function productLink(product: string | null | undefined): { label: string; url: string } {
  const entry = RECEPTIONIST_PRODUCTS[(product ?? "other") as ReceptionistProduct] ?? RECEPTIONIST_PRODUCTS.other;
  return { label: entry.label, url: `${site.url}${entry.path}` };
}

const money = (n: number) => `$${n.toFixed(2)}`;

function tierLines(productType: string): string {
  // Below the lowest tier, getUnitPrice charges the lowest tier's rate, so the
  // first tier really starts at 1 piece.
  const tiers = [...getPricingTiers(productType)].sort((a, b) => a.minQty - b.minQty);
  return tiers
    .map((t, i) => `${i === 0 ? 1 : t.minQty}+ pieces: ${money(t.unitPrice)} each`)
    .join("; ");
}

/** Hat prices vary by cap style, so they are given as a range per quantity. */
function hatLines(): string {
  const styles = CAP_BRANDS.flatMap((b) => getStylesByBrand(b));
  return [1, 12, 25, 50, 100]
    .map((qty) => {
      const each = styles.map((s) => quoteOrder({ styleId: s.id, quantity: qty, placements: [] }).perHat);
      return `${qty} hats: ${money(Math.min(...each))} to ${money(Math.max(...each))} each`;
    })
    .join("; ");
}

/** The answer the get_pricing tool returns for one product. */
export function pricingAnswer(product: string): string {
  const link = productLink(product);
  switch (product as ReceptionistProduct) {
    case "hats":
      return (
        `Custom embroidered hats, front logo included. Price depends on the cap style: ${hatLines()}. ` +
        `Side or back embroidery and 3D puff stitching cost extra. ` +
        `Free shipping on ${FREE_SHIPPING_QTY} or more hats. Exact price for any style is on ${link.url}`
      );
    case "polos":
    case "womens_polos":
      return (
        `Embroidered polos (BAW 100% polyester, men's and women's cuts, 25 colours), left chest logo included: ` +
        `${tierLines("Custom Polos")}. Adding a name on the right side is +${money(POLO_DUAL_PLACEMENT_PER_PIECE)} per polo. ` +
        `Order at ${link.url}`
      );
    case "shirts":
      return (
        `DTF printed shirts, front and back print both included. Dri-Fit short sleeve: ${tierLines("Shirt Printing (Dri-Fit, Short Sleeve)")}. ` +
        `Dri-Fit long sleeve: ${tierLines("Shirt Printing (Dri-Fit, Long Sleeve)")}. Cotton is $2 less per shirt at every quantity. ` +
        `Order at ${link.url}`
      );
    case "safety_vests":
      return `Hi-vis safety vests with your logo, front and/or back: ${tierLines("Safety Vests")}. Order at ${link.url}`;
    case "new_hire":
      return (
        `The New Hire bundle is ${money(NEW_HIRE_PRICE)}: 3 embroidered polos, 1 embroidered cap, 1 safety vest ` +
        `with logo, and 3 hardhat stickers. Order at ${link.url}`
      );
    case "hoodies":
      return (
        `Embroidered hoodies start around ${money(getPricingTiers("Custom Hoodies").at(-1)?.unitPrice ?? 45)} for one piece ` +
        `and drop with quantity; sweaters are similar. The owner will follow up with exact options.`
      );
    default:
      return (
        `We also do custom acrylic signage, stickers, business cards and flyers. Those are quoted by the owner, ` +
        `who will follow up. They can also reach us at ${link.url}`
      );
  }
}

/** The facts every receptionist conversation starts from. */
export function businessFacts(): string {
  return [
    `Business: ${site.name} (formerly ${site.formerName}), a custom embroidery and printing shop in ${site.address.locality}, Texas, serving the Rio Grande Valley.`,
    `Website: ${site.url}. Email: ${site.email}.`,
    `Products: embroidered hats, polos (men's and women's), hoodies and sweaters; DTF printed shirts; safety vests with logos; the New Hire bundle; plus acrylic signage, stickers, business cards and flyers.`,
    `No minimum order: one piece or two hundred. Price per piece drops as quantity goes up.`,
    `Every order starts with a free digital proof by email. Nothing is made until the customer approves it.`,
    `Most orders finish in 5 to 7 business days after the proof is approved. The shop is closed on weekends.`,
    `Free local pickup and delivery in ${LOCAL_DELIVERY_CITY_LIST}. Anywhere else in the US, orders ship and the rate is shown at checkout.`,
    `Customers order and pay online at the website, upload their logo there, and get the proof by email. Visits are by appointment.`,
  ].join("\n");
}
