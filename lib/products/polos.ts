/**
 * Polo catalog data, shared by the polo configurator and the New Hire bundle.
 *
 * This lived inside app/products/custom-polos/page.tsx until the bundle needed
 * the same colourways. Duplicating a 25-entry list is how two pages end up
 * offering different colours for the same garment, so it moved here instead.
 */

export const POLO_STYLE = "BAW 100% Polyester Polo";

export type PoloColor = { name: string; hex: string; front: string };

const BASE = "/images/home/BAW%20Polos/";
const img = (front: string): { front: string } => ({ front: BASE + front });

export const POLO_COLORS: PoloColor[] = [
  { name: "Black",          hex: "#111111", ...img("Black_Front.jpeg")          },
  { name: "Canary",         hex: "#f5d000", ...img("Canary_Front.jpeg")         },
  { name: "Cardinal",       hex: "#8b1a2a", ...img("Cardinal_Front.jpeg")       },
  { name: "Charcoal",       hex: "#4a4a4a", ...img("Charcoal_Front.jpeg")       },
  { name: "Columbia Blue",  hex: "#6ea8cd", ...img("Columbia_Blue_Front.jpeg")  },
  { name: "Dark Green",     hex: "#1f5f3b", ...img("Dark_Green_Front.jpeg")     },
  { name: "Gold",           hex: "#c4922a", ...img("Gold_Front.jpeg")           },
  { name: "Heathered Gray", hex: "#9e9e9e", ...img("Heathered_Gray_Front.jpeg") },
  { name: "Kelly",          hex: "#2e7d32", ...img("Kelly_Front.jpeg")          },
  { name: "Light Pink",     hex: "#f5b8c8", ...img("Light_Pink_Front.jpeg")     },
  { name: "Maroon",         hex: "#6b1023", ...img("Maroon_Front.jpeg")         },
  { name: "Navy",           hex: "#13294b", ...img("Navy_Front.jpeg")           },
  { name: "Neon Pink",      hex: "#f060a0", ...img("Neon_Pink_Front.jpeg")      },
  { name: "Orange",         hex: "#e87020", ...img("Orange_Front.jpeg")         },
  { name: "Peach",          hex: "#f4b896", ...img("Peach_Front.jpeg")          },
  { name: "Purple",         hex: "#6b3494", ...img("Purple_Front.jpeg")         },
  { name: "Red",            hex: "#cc2222", ...img("Red_Front.jpeg")            },
  { name: "Royal",          hex: "#2355b8", ...img("Royal_Front.jpeg")          },
  { name: "Sea Foam",       hex: "#5fbfad", ...img("Sea_Foam_Front.jpeg")       },
  { name: "Silver",         hex: "#c0c0c0", ...img("Silver_Front.jpeg")         },
  { name: "Sky Blue",       hex: "#4db8e8", ...img("Sky_Blue_Front.jpeg")       },
  { name: "Teal",           hex: "#008080", ...img("Teal_Front.jpeg")           },
  { name: "Texas Orange",   hex: "#c14c00", ...img("Texas_Orange_Front.jpeg")   },
  { name: "Vegas Gold",     hex: "#c5a028", ...img("Vegas_Gold_Front.jpeg")     },
  { name: "White",          hex: "#f5f5f5", ...img("White_Front.jpeg")          },
];

export const POLO_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

/*
 * Cut, not a separate product.
 *
 * A women's polo is the same garment class, the same embroidery and the same
 * price as the men's, so it is a fit here rather than a page of its own: one
 * price table to keep current, and a customer kitting out a mixed team picks
 * per line instead of checking out twice.
 *
 * `fallbackImage` is set only where no per-colour photography exists. The men's
 * line has 25 photographs; the women's cuts have one mockup each, so they fall
 * back to it and the UI says so rather than implying the shown colour is the
 * only one available. Add real photos and the fallback stops applying.
 */
export type PoloFit = {
  id: string;
  label: string;
  fallbackImage?: string;
  note?: string;
};

export const POLO_FITS: PoloFit[] = [
  { id: "mens", label: "Men's" },
  {
    id: "womens",
    label: "Women's",
    fallbackImage: "/images/products/polo-womens.webp",
    note: "Women's cut, short sleeve. Photographed in one colourway; the full colour range below is available.",
  },
  {
    id: "womens-34",
    label: "Women's 3/4 Sleeve",
    fallbackImage: "/images/products/polo-womens-three-quarter.webp",
    note: "Women's cut, three-quarter sleeve. Photographed in one colourway; the full colour range below is available.",
  },
];
