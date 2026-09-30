type Category = {
  name: string;
  href: string;
  icon?: string;
  image?: string;
};

export const categories: Category[] = [
  {
    name: "Custom Hats",
    href: "/products/custom-hats",
    image: "/images/products/cap-110-b2z.webp"
  },
  {
    name: "Custom Polos",
    href: "/products/custom-polos",
    image: "/images/products/polo-mens-bf.webp"
  },
  /*
   * Hidden 2026-09-30, temporarily, at Eric's request.
   *
   * Both artworks still carry the El Hilo Co logo, and this list feeds the
   * header and mobile navigation as well as the home grid, so leaving them in
   * showed the old brand in three places. The product pages themselves are
   * untouched and still serve at their URLs, so no link or search result
   * breaks; they are only unlisted.
   *
   * Restore by uncommenting once the replacement mockups exist.
   */
  // {
  //   name: "Custom Hoodies",
  //   href: "/products/custom-hoodies",
  //   image: "/images/products/<new hoodie mockup>"
  // },
  // {
  //   name: "Custom Sweaters",
  //   href: "/products/custom-sweaters",
  //   image: "/images/products/<new sweater mockup>"
  // },
  {
    // Not a separate product page: the women's cut is a fit option on the polo
    // configurator, so this deep-links to it with that fit preselected. One
    // price table, and a mixed-team order stays in a single checkout.
    name: "Women's Polos",
    href: "/products/custom-polos?fit=womens",
    image: "/images/products/polo-womens.webp"
  },
  {
    name: "Shirt Printing",
    href: "/products/shirt-printing",
    image: "/images/products/shirt-printing-front.webp"
  },
  {
    name: "Safety Vests",
    href: "/products/safety-vests",
    image: "/images/products/safety-vest-back.webp"
  },
];

export const bestSellers = [
  {
    title: "The New Hire — $115",
    image: "/images/products/safety-vest-front.webp",
    href: "/products/new-hire",
    imageScale: "scale-[1]",
  },
  {
    title: "Premium Stitched",
    image: "/images/products/cap-110-b2z.webp",
    href: "/products/custom-hats",
    imageScale: "scale-[1]",
  },
 {
  title: "3D Puff Hats",
  image: "/images/home/Home Content/3D_Puff_ELHILOCO.svg",
  href: "/products/custom-hats",
  imageScale: "scale-[1]",
},
  {
    title: "Stitched Polos",
    image: "/images/products/polo-mens-bf.webp",
    href: "/products/custom-polos",
    imageScale: "scale-[1]",
  },
  // Hidden with the hoodie category above, same reason, same fix.
  // {
  //   title: "Stitched Hoodies",
  //   image: "/images/products/<new hoodie mockup>",
  //   href: "/products/custom-hoodies",
  //   imageScale: "scale-[1]",
  // },
];

export const processSteps = [
  {
    image: "/images/brand/bf-upload.png",
    step: 1,
    title: "Upload your artwork",
    description:
      "Send us your logo, design, or concept and we will prepare it for embroidery.",
  },
  {
    image: "/images/brand/bf-approved.png",
    step: 2,
    title: "Review and Approve",
    description:
      "We send a proof, make any needed adjustments, and get approval before production begins.",
  },
  {
    image: "/images/brand/bf-box.png",
    step: 3,
    title: "Receive your Order",
    description:
      "We stitch, pack, and ship your order with a clean turnaround and premium finish.",
  },
];

/**
 * Customer logos for the "Trusted by brands big and small" marquee.
 *
 * The track renders `[...logos, ...logos]` so the loop is seamless, which means
 * each file appears twice. Every entry needs a real file in public/images/home
 * or the slot renders empty, since next/image has nothing to fall back to.
 *
 * Each renders into an h-16 w-48 box with object-contain, so wide wordmarks fill
 * the slot and tall or square marks are constrained by height and read smaller.
 */
export const logos = [
  { src: "/images/home/B2Z Engineering.png", alt: "B2Z Engineering" },
  { src: "/images/home/B2Z Enterprises Logo.png", alt: "B2Z Enterprises" },
  { src: "/images/home/Onyx Aesthetics Logo.png", alt: "Onyx Aesthetics" },
  { src: "/images/home/PEAK_ATHLETIC_CLUB.png", alt: "Peak Athletic Club" },
  { src: "/images/home/Alpha Heating and Air.png", alt: "Alpha Heating and Air Conditioning" },
];