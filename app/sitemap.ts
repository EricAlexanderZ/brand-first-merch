import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { site } from "@/lib/site";

/**
 * Static, public routes only.
 *
 * Anything behind auth (dashboard, admin, checkout) and anything transactional
 * (cart, order confirmation, artwork upload) is deliberately absent: those
 * pages cannot rank and a sitemap full of them dilutes the crawl budget on a
 * small site.
 */
const ROUTES: { path: string; priority: number }[] = [
  { path: "",                          priority: 1.0 },
  { path: "/products/custom-hats",     priority: 0.9 },
  { path: "/products/custom-polos",    priority: 0.9 },
  { path: "/products/custom-hoodies",  priority: 0.8 },
  { path: "/products/custom-sweaters", priority: 0.8 },
  { path: "/blog",                     priority: 0.8 },
  // { path: "/about",                 priority: 0.6 },  // temporarily hidden
  { path: "/faq",                      priority: 0.6 },
  { path: "/contact",                  priority: 0.7 },
  { path: "/privacy",                  priority: 0.3 },
  { path: "/terms",                    priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...ROUTES.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.updated ?? post.date),
      changeFrequency: "monthly" as const,
      // City posts are the pages actually chasing local rankings, so they sit
      // above ordinary content pages.
      priority: post.citySlug ? 0.8 : 0.9,
    })),
  ];
}
