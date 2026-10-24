// Server use only: it reaches Shippo with the secret API token.
import { getShippoRates } from "@/lib/shippo";
import { estimateWeightOz, hasFreeShipping } from "@/lib/checkout";
import { isLocalDeliveryEligible, localDeliveryMethod } from "@/lib/local-delivery";
import type { CartItem } from "@/types/cart";
import type { DeliveryMethod } from "@/types/checkout";

/**
 * Delivery options and their prices, decided on the server.
 *
 * Checkout shows these, and the payment route asks for them again and charges
 * the price found here for the option the customer picked. The browser only
 * ever says which option it wants, never what it costs.
 */

export type DeliveryAddress = {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
};

type ShippedItem = Pick<CartItem, "productType" | "quantity">;

export async function getDeliveryOptions(
  address: DeliveryAddress,
  items: ShippedItem[]
): Promise<DeliveryMethod[]> {
  let rates: DeliveryMethod[] = await getShippoRates({
    name:     address.name || "Customer",
    address1: address.line1,
    address2: address.line2,
    city:     address.city,
    state:    address.state,
    zip:      address.zip,
    country:  "US",
    weightOz: estimateWeightOz(items),
  });

  // The hat page promises free shipping at 25+ hats. Honour it by making the
  // cheapest carrier option free rather than inventing a new service.
  if (hasFreeShipping(items) && rates.length > 0) {
    const cheapest = rates.reduce((a, b) => (b.price < a.price ? b : a));
    rates = rates.map((r) =>
      r.id === cheapest.id ? { ...r, price: 0, label: `${r.label} (free with 25+ hats)` } : r
    );
  }

  // Free local delivery goes first, ahead of every carrier rate, because it
  // is both the cheapest and the fastest for anyone it applies to. Offered
  // only when the address actually qualifies.
  return isLocalDeliveryEligible(address.city, address.state)
    ? [localDeliveryMethod(), ...rates]
    : rates;
}

/**
 * The server's price for the option a customer picked, or null if that option
 * is not offered for this address and cart.
 *
 * Matched by label, because carrier rate ids are minted fresh on every quote.
 */
export async function findDeliveryOption(
  address: DeliveryAddress,
  items: ShippedItem[],
  label: string
): Promise<DeliveryMethod | null> {
  const options = await getDeliveryOptions(address, items);
  return options.find((o) => o.label === label) ?? null;
}

/**
 * The server's price for a plain carrier rate (no local delivery, no hat
 * offer), for the promo page, which handles local fulfilment itself.
 */
export async function findCarrierRate(
  address: DeliveryAddress,
  weightOz: number,
  label: string
): Promise<DeliveryMethod | null> {
  const rates: DeliveryMethod[] = await getShippoRates({
    name:     address.name || "Customer",
    address1: address.line1,
    address2: address.line2,
    city:     address.city,
    state:    address.state,
    zip:      address.zip,
    country:  "US",
    weightOz,
  });
  return rates.find((r) => r.label === label) ?? null;
}
