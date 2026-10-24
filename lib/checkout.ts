import type {
  ShippingFormData,
  ShippingFormErrors,
} from "@/types/checkout";
import type { CartItem } from "@/types/cart";
import { FREE_SHIPPING_QTY } from "@/lib/pricing";

export const US_STATES: [code: string, name: string][] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
  ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
  ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
  ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
  ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

/**
 * Rough shipped weight of one piece, in ounces, by product type prefix.
 *
 * Estimates, not scale readings. They exist because every order used to be
 * quoted as one pound, so thirty polos cost the same to ship as a single cap.
 */
const PIECE_WEIGHT_OZ: [prefix: string, oz: number][] = [
  ["Custom Hats",     4],
  ["Custom Polos",    8],
  ["Custom Hoodies", 20],
  ["Custom Sweaters", 16],
  ["Shirt Printing",  6],
  ["Safety Vests",    5],
  ["The New Hire",   34], // 3 polos, a cap, a vest and stickers in one bundle
];
const DEFAULT_PIECE_OZ = 8;
const PACKAGING_OZ     = 6;

export function estimateWeightOz(items: Pick<CartItem, "productType" | "quantity">[]): number {
  const pieces = items.reduce((sum, item) => {
    const oz = PIECE_WEIGHT_OZ.find(([p]) => item.productType.startsWith(p))?.[1] ?? DEFAULT_PIECE_OZ;
    return sum + oz * item.quantity;
  }, 0);
  return Math.max(16, pieces + PACKAGING_OZ);
}

/**
 * True when the hat page promised this cart free shipping.
 *
 * The configurator shows "Free shipping included" from FREE_SHIPPING_QTY hats
 * on one line; checkout has to keep that promise.
 */
export function hasFreeShipping(items: Pick<CartItem, "productType" | "quantity">[]): boolean {
  return items.some((i) => i.productType === "Custom Hats" && i.quantity >= FREE_SHIPPING_QTY);
}

export const DEFAULT_SHIPPING_FORM: ShippingFormData = {
  email: "",
  subscribe: true,
  firstName: "",
  lastName: "",
  phone: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
};

export function validateShippingForm(
  form: ShippingFormData
): ShippingFormErrors {
  const errors: ShippingFormErrors = {};

  if (!form.email.trim()) errors.email = "Email is required.";
  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  if (!form.phone.trim()) errors.phone = "Phone is required.";
  if (!form.address1.trim()) errors.address1 = "Street address is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) errors.state = "State is required.";
  if (!form.zip.trim()) errors.zip = "Zip code is required.";

  return errors;
}

export function hasShippingErrors(errors: ShippingFormErrors) {
  return Object.keys(errors).length > 0;
}

export function getShippingLabel(
  selectedDelivery: { label: string; price: number } | null
) {
  if (!selectedDelivery) return "Select method";

  return `${selectedDelivery.label} - ${
    selectedDelivery.price === 0
      ? "Free"
      : `$${selectedDelivery.price.toFixed(2)}`
  }`;
}