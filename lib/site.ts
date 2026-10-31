/**
 * Single source of truth for everything factual about the business.
 *
 * NAP (name, address, phone) consistency is the backbone of local SEO. Google
 * cross-references it against the Google Business Profile and directory
 * listings, and a mismatch anywhere weakens the whole domain. Declared once
 * here; every page, footer and JSON-LD block reads from this object. Never
 * hardcode these in a component.
 */

export const site = {
  name: "Brand First Merch",

  /**
   * The business as registered: a sole proprietorship (EIN on file) trading as
   * Brand First Merch. There is no LLC; earlier copy named "El Hilo Co LLC",
   * which was never the registered entity. Terms and Privacy name this.
   */
  legalName: "Brand First Merch",

  /**
   * The previous trade name. Kept deliberately rather than deleted.
   *
   * The Google Business Profile, its reviews and every existing backlink point
   * at "El Hilo Co". Naming the old brand once on the site is what lets Google
   * treat the two as one entity instead of a new business with no history.
   * Remove this only after the profile rename has settled, months out.
   */
  formerName: "El Hilo Co",
  tagline: "Custom embroidery and printing in the Rio Grande Valley",
  /**
   * Meta description. Deliberately short: Google truncates around 155
   * characters in results, so this is the trimmed version of `longDescription`
   * rather than the whole thing.
   */
  description:
    "Custom embroidery and printing in the Rio Grande Valley. Hats, polos, hoodies, DTF shirts and signage, with free local pickup and delivery. No minimum order.",

  /**
   * The full description, kept word for word identical to the Google Business
   * Profile description. Used for the LocalBusiness schema, where there is room
   * for it and where matching the profile matters: two descriptions of the same
   * business that disagree are two things Google has to reconcile, and it is
   * one of the signals that decides whether the site and the profile are
   * treated as one entity.
   *
   * If the Business Profile text is ever edited, edit this to match.
   *
   * Last synced 2026-09-23. The profile copy carries paragraph breaks that
   * are flattened to spaces here, because schema.org description is a plain
   * string; the wording is otherwise identical.
   */
  longDescription:
    "Brand First Merch, formerly El Hilo Co, is a custom embroidery and printing shop serving the Rio Grande Valley. We stitch hats, polos, hoodies and sweaters for businesses, teams, schools and events. We also do DTF shirt printing, custom acrylic signage, stickers, business cards and flyers. Free local pickup and delivery across Palmview, Alton, Mission, McAllen, Edinburg and Pharr. No minimum order. One piece or two hundred, work is priced per piece and the price falls as quantity rises. Ten cap styles, with front, side or back placement, and pricing you can see before you order. Every job starts with a digital proof. Nothing is made until you approve it, and most orders finish in five to seven business days. Orders are by appointment.",

  /**
   * Used for canonicals, the sitemap and JSON-LD, so it must be the exact host
   * that serves a 200.
   *
   * Cut over to brandfirstmerch.com 2026-09-24, once the domain was attached
   * and serving, not before. Measured at the time of the change:
   *
   *   brandfirstmerch.com       200, valid certificate  <- canonical
   *   www.brandfirstmerch.com   308 -> apex
   *   elhiloco.com              308 -> apex
   *   www.elhiloco.com          308 -> apex
   *
   * The apex is canonical here, where the old domain used www. All three other
   * hosts reach it in a single hop with the path preserved, so an indexed URL
   * maps to its exact equivalent rather than to the home page.
   *
   * The old hosts stay attached to the project permanently. They are what
   * carries the existing ranking and anyone's bookmarks; deleting them throws
   * that away. There is no cost to leaving them.
   */
  url: "https://brandfirstmerch.com",

  /**
   * The Google "write a review" form for this listing.
   *
   * ⚠️ There is no API that posts a review to Google. That is deliberate on
   * Google's part: a write API would make fake reviews trivial. Sending the
   * customer to Google's own form is the only supported route, and the only
   * one that produces a review that actually appears on the listing.
   *
   * Get this from the Business Profile: Read reviews -> Get more reviews, which
   * yields a short link of the form https://g.page/r/<id>/review
   *
   * Empty is handled: /review falls back to the Maps listing so the page is
   * never a dead end. Fill it in, because the fallback costs the customer an
   * extra tap and loses some of them.
   */
  googleReviewUrl: "https://g.page/r/CS72F3FhN4O5EAI/review",

  /**
   * Text only, by the owner's instruction. Rendered as an sms: link everywhere
   * so nobody dials a number that does not take calls.
   */
  phone: "(956) 332-3651",
  phoneE164: "+19563323651",
  smsHref: "sms:+19563323651",

  /**
   * Moved 2026-09-24, after the mailbox existed and was proven, not before.
   * Authentication and delivery were both tested: smtp.gmail.com accepted the
   * app password and returned 250 for a message addressed to this box.
   *
   * Worth recording why that test mattered. The previous address could send but
   * never receive: elhiloco.com had no MX records, so every customer reply
   * bounced for the life of the old site. This domain has MX and SPF.
   */
  email: "orders@brandfirstmerch.com",

  /**
   * Confirmed 2026-08-17: there is no storefront. This is a service-area
   * business, so this is city, region and country only — deliberately no
   * street address anywhere on the site or in the schema.
   *
   * That is the correct shape, not a gap. Publishing a home address for an SAB
   * is the common mistake: it exposes a private address and Google can suspend
   * a listing whose address does not match a staffed, visitable location.
   * `areaServed` in the LocalBusiness block is what carries the geography here.
   *
   * The Google Business Profile must be configured the same way — set as a
   * service-area business with the address hidden — or the profile and the site
   * disagree, which is exactly the inconsistency that weakens local ranking.
   */
  address: {
    locality: "Palmview",
    region: "TX",
    country: "US",
  },
} as const;

/**
 * Cities targeted for local search, in the order they matter commercially.
 *
 * Each one drives a blog post, a sitemap entry and an `areaServed` entry in the
 * LocalBusiness schema. `areaServed` is what justifies ranking outside the home
 * city, and the per-city pages are what actually rank for "embroidery in
 * <city>" — the phrasing RGV buyers really use alongside "near me".
 */
export type ServiceCity = {
  slug: string;
  name: string;
  county: string;
  /** Honest, human context. Used in copy; keep it true. */
  blurb: string;
};

export const serviceCities: ServiceCity[] = [
  {
    slug: "palmview",
    name: "Palmview",
    county: "Hidalgo County",
    blurb:
      "Our home base. Same-day proofs and free drop-off for Palmview businesses, schools and teams.",
  },
  {
    slug: "alton",
    name: "Alton",
    county: "Hidalgo County",
    blurb:
      "Next door to us on the Expressway 83 corridor. Free drop-off for Alton businesses, schools and teams.",
  },
  {
    slug: "mission",
    name: "Mission",
    county: "Hidalgo County",
    blurb:
      "Minutes east on Expressway 83. Free pickup and delivery for Mission shops, clinics and school groups.",
  },
  {
    slug: "mcallen",
    name: "McAllen",
    county: "Hidalgo County",
    blurb:
      "The Valley's biggest commercial base, and our busiest route for corporate uniform runs.",
  },
  {
    slug: "edinburg",
    name: "Edinburg",
    county: "Hidalgo County",
    blurb:
      "University town work: club apparel, athletics, and staff polos for county offices.",
  },
  {
    slug: "pharr",
    name: "Pharr",
    county: "Hidalgo County",
    blurb:
      "Logistics and trade country. Durable embroidered workwear that survives a real shift.",
  },
];

export const cityNames = serviceCities.map((c) => c.name);

/** "Palmview, Alton, Mission, McAllen, Edinburg and Pharr" — for prose. */
export const cityList = `${cityNames.slice(0, -1).join(", ")} and ${cityNames[cityNames.length - 1]}`;

export function getCity(slug: string): ServiceCity | undefined {
  return serviceCities.find((c) => c.slug === slug);
}
