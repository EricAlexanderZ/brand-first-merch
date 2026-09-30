/**
 * Cap catalog — presentation data (colorways + images) for the /hats configurator.
 *
 * Wholesale costs and all pricing math live in `lib/pricing.ts`. This file only
 * describes how each style is shown.
 *
 * ─── IMAGE CONVENTION ──────────────────────────────────────────────────────
 * Drop photos in:  public/images/caps/<styleId>/<color-slug>-front.jpg
 *                  public/images/caps/<styleId>/<color-slug>-side.jpg
 *
 * e.g.  public/images/caps/otto-6-panel-trucker/black-white-front.jpg
 *
 * Paths are generated automatically by capImage(). Nothing needs to be wired up
 * by hand — until a file exists the configurator falls back to a color mockup,
 * and the photo appears the moment it lands in the folder.
 *
 * ─── COLORWAYS ARE PLACEHOLDERS ────────────────────────────────────────────
 * The lists below are common stock colorways, NOT confirmed against the OTTO /
 * Pitbull Caps dealer catalogs. Replace each array with the real colorways
 * when the client supplies them.
 */

import { CAP_STYLES, type CapStyle } from "@/lib/pricing";

export type CapColor = {
  name: string;
  hex:  string;
  hex2?: string;  // second hex renders a split swatch for two-tone caps
};

export type PreviewAngle = "front" | "side" | "back";

export const PREVIEW_ANGLES: PreviewAngle[] = ["front", "side", "back"];

/**
 * Angles a style actually has photos for. Not every drop includes all three —
 * the 6 Panel Dad Hat shipped front/back only — and offering a tab that can
 * only ever show a fallback mockup looks broken. Omit a style to get all three.
 */
const STYLE_ANGLES: Record<string, PreviewAngle[]> = {
  "otto-6-panel-dad": ["front", "back"],
  "pb311":            ["front", "back"],
  "pb136k":           ["front", "back"],
  "pb274c":           ["front"],
  "pb301":            ["front", "back"],
  "pb275":            ["front"],
  // Client supplied front views only for this drop.
  "lonestar-gameday-hydro": ["front"],
  "lonestar-elite-hydro":   ["front"],
};

export function getAngles(styleId: string): PreviewAngle[] {
  return STYLE_ANGLES[styleId] ?? PREVIEW_ANGLES;
}

// ---------------------------------------------------------------------------
// Shared colorway sets
// ---------------------------------------------------------------------------

export const SOLIDS: CapColor[] = [
  { name: "Black",         hex: "#111111" },
  { name: "White",         hex: "#f5f5f5" },
  { name: "Navy",          hex: "#13294b" },
  { name: "Charcoal Gray", hex: "#4a4a4a" },
  { name: "Heather Gray",  hex: "#9e9e9e" },
  { name: "Khaki",         hex: "#b59b6a" },
  { name: "Red",           hex: "#b91c1c" },
  { name: "Royal Blue",    hex: "#2355b8" },
  { name: "Forest Green",  hex: "#1f5f3b" },
];

/** PLACEHOLDER two-tones — still used by pb222 (Cambridge mesh trucker). */
const TWO_TONES: CapColor[] = [
  { name: "Black / White",    hex: "#111111", hex2: "#f5f5f5" },
  { name: "Navy / White",     hex: "#13294b", hex2: "#f5f5f5" },
  { name: "Charcoal / Black", hex: "#4a4a4a", hex2: "#111111" },
  { name: "Khaki / Black",    hex: "#b59b6a", hex2: "#111111" },
  { name: "Red / White",      hex: "#b91c1c", hex2: "#f5f5f5" },
];

/**
 * REAL colorways — OTTO 112-1, read off the client's photo drop (front/side/back
 * for all 49). OTTO names these Front/Mesh/Visor; the visor matches the front
 * panel on every one of these, so the name is Front / Mesh. `hex` is the front
 * panel, `hex2` the mesh — both sampled from the photos themselves.
 *
 * The four "White Stitch" entries are the same fabric colors as their plain
 * counterparts and differ only in contrast stitching.
 */
const OTTO_TRUCKER_COLORS: CapColor[] = [
  // Solids
  { name: "Black",                        hex: "#2b2a2d", hex2: "#242328" },
  { name: "Black / White Stitch",         hex: "#2e2d32", hex2: "#242328" },
  { name: "Charcoal Gray",                hex: "#635d65", hex2: "#645e63" },
  { name: "Charcoal Gray / White Stitch", hex: "#524e56", hex2: "#645e63" },
  { name: "Navy",                         hex: "#34364c", hex2: "#282a3a" },
  { name: "Navy / White Stitch",          hex: "#272b40", hex2: "#262938" },
  { name: "Dark Green",                   hex: "#213534", hex2: "#2f3d3a" },
  { name: "Dark Green / White Stitch",    hex: "#2a3533", hex2: "#344341" },
  { name: "Royal Blue",                   hex: "#354486", hex2: "#36457f" },
  { name: "Red",                          hex: "#cd3639", hex2: "#c8424c" },
  { name: "Maroon",                       hex: "#5a2132", hex2: "#532631" },
  { name: "Burgundy",                     hex: "#7a2837", hex2: "#712936" },
  { name: "Purple",                       hex: "#463562", hex2: "#44336c" },
  { name: "Olive Green",                  hex: "#706a55", hex2: "#6e6957" },
  { name: "Khaki",                        hex: "#9a7d64", hex2: "#a29280" },
  { name: "Texas Orange",                 hex: "#b5593d", hex2: "#a9614c" },
  { name: "Gray",                         hex: "#a7a1a0", hex2: "#9f9ca0" },
  { name: "White",                        hex: "#e5e4f0", hex2: "#e0e0ec" },

  // Two-tones
  { name: "Black / White",                hex: "#1f1f22", hex2: "#e8e9f4" },
  { name: "Black / Red",                  hex: "#28272b", hex2: "#b63840" },
  { name: "Black / Charcoal Gray",        hex: "#323136", hex2: "#5f5b62" },
  { name: "Black / Khaki",                hex: "#262528", hex2: "#c3b4ab" },
  { name: "Navy / White",                 hex: "#202234", hex2: "#dad6e2" },
  { name: "Navy / Charcoal Gray",         hex: "#26283b", hex2: "#5f5b62" },
  { name: "Navy / Khaki",                 hex: "#292b3f", hex2: "#ad9d94" },
  { name: "Charcoal Gray / White",        hex: "#5a555d", hex2: "#f0f1f9" },
  { name: "Charcoal Gray / Black",        hex: "#6a646d", hex2: "#26252a" },
  { name: "Charcoal Gray / Royal Blue",   hex: "#5e585f", hex2: "#334782" },
  { name: "Red / White",                  hex: "#bc2139", hex2: "#e5e4ef" },
  { name: "Red / Black",                  hex: "#c52d43", hex2: "#232328" },
  { name: "Royal Blue / White",           hex: "#1b3c82", hex2: "#e1e2ee" },
  { name: "Columbia Blue / White",        hex: "#739bd3", hex2: "#e6e7f4" },
  { name: "Aqua / White",                 hex: "#47bddd", hex2: "#eeeff8" },
  { name: "Kelly Green / White",          hex: "#0e854e", hex2: "#eaecf4" },
  { name: "Kelly Green / Black",          hex: "#32815c", hex2: "#26252a" },
  { name: "Dark Green / Khaki",           hex: "#293b38", hex2: "#c3b4ab" },
  { name: "Olive Green / White",          hex: "#706a62", hex2: "#e9ebf5" },
  { name: "Maroon / White",               hex: "#6a1b2d", hex2: "#e4e4f0" },
  { name: "Burgundy / Black",             hex: "#782736", hex2: "#26252a" },
  { name: "Purple / White",               hex: "#312350", hex2: "#e8e9f4" },
  { name: "Hot Pink / White",             hex: "#d6397a", hex2: "#eae9f3" },
  { name: "Hot Pink / Black",             hex: "#df428c", hex2: "#26252a" },
  { name: "Neon Orange / Black",          hex: "#ec774b", hex2: "#262529" },
  { name: "Texas Orange / Khaki",         hex: "#ad4f33", hex2: "#bba99d" },
  { name: "Khaki / White",                hex: "#9e8269", hex2: "#d7d3d4" },
  { name: "Light Khaki / Dark Brown",     hex: "#d5c4b8", hex2: "#59423f" },
  { name: "Brown / Khaki",                hex: "#4c322f", hex2: "#c3b4ab" },
  { name: "Brown / Natural",              hex: "#504642", hex2: "#dbd7d8" },
  { name: "Dark Brown / Khaki",           hex: "#3c2a25", hex2: "#bba99d" },
];

/**
 * REAL colorways — PB301 Hybrid Perforated Rope, read off the client's photo
 * drop (2026-08-09). Four solids, each with a speckled rope across the brim:
 * black/white on Black, Red and White; red/white on Burgundy. The cap color is
 * the only thing that varies, so it carries the name. `hex` = cap, `hex2` = rope.
 */
const PB301_COLORS: CapColor[] = [
  { name: "Black",    hex: "#151513", hex2: "#1a1a1a" },
  { name: "White",    hex: "#dfdede", hex2: "#1a1a1a" },
  { name: "Red",      hex: "#b9131f", hex2: "#1a1a1a" },
  { name: "Burgundy", hex: "#572728", hex2: "#b3202a" },
];

// ---------------------------------------------------------------------------
// Per-style colorways
// ---------------------------------------------------------------------------

/**
 * REAL colorways — OTTO 31-069, confirmed against the client's photo drops.
 * Two ranges so far: 13 Solids + 35 Crown Split two-tones, each with
 * front/side/back photography. `hex` is the crown, `hex2` the bill.
 */
const OTTO_AFRAME_SOLIDS: CapColor[] = [
  { name: "Black",         hex: "#111111" },
  { name: "Charcoal Gray", hex: "#4a4a4a" },
  { name: "Dark Brown",    hex: "#4a3728" },
  { name: "Dark Green",    hex: "#1f4a2c" },
  { name: "Gray",          hex: "#9ea3a8" },
  { name: "Khaki",         hex: "#b59b6a" },
  { name: "Maroon",        hex: "#6b2233" },
  { name: "Navy",          hex: "#13294b" },
  { name: "Pink",          hex: "#f4b8c8" },
  { name: "Red",           hex: "#c8102e" },
  { name: "Royal Blue",    hex: "#1e4fa3" },
  { name: "White",         hex: "#f5f5f5" },
  { name: "Yellow",        hex: "#f5c518" },
];

/** OTTO 31-069 "Crown Split" range — contrast crown/bill two-tones. */
const OTTO_AFRAME_CROWN_SPLIT: CapColor[] = [
  { name: "Black / Charcoal",           hex: "#111111", hex2: "#4a4a4a" },
  { name: "Black / Gray",               hex: "#111111", hex2: "#9ea3a8" },
  { name: "Black / Khaki",              hex: "#111111", hex2: "#b59b6a" },
  { name: "Black / Natural",            hex: "#111111", hex2: "#e8dfc8" },
  { name: "Black / Red",                hex: "#111111", hex2: "#c8102e" },
  { name: "Black / White",              hex: "#111111", hex2: "#f5f5f5" },
  { name: "Brown / Natural",            hex: "#4a3728", hex2: "#e8dfc8" },
  { name: "Caribbean Green / Natural",  hex: "#00a99d", hex2: "#e8dfc8" },
  { name: "Cool Blue / Natural",        hex: "#6b8fb5", hex2: "#e8dfc8" },
  { name: "Gray / Navy",                hex: "#9ea3a8", hex2: "#13294b" },
  { name: "Gray / Royal Blue",          hex: "#9ea3a8", hex2: "#1e4fa3" },
  { name: "Green / Natural",            hex: "#1f4a2c", hex2: "#e8dfc8" },
  { name: "Green / White",              hex: "#1f4a2c", hex2: "#f5f5f5" },
  { name: "Khaki / Natural",            hex: "#b59b6a", hex2: "#e8dfc8" },
  { name: "Lavender / Natural",         hex: "#b8a5cc", hex2: "#e8dfc8" },
  { name: "Maroon / Gray",              hex: "#6b2233", hex2: "#9ea3a8" },
  { name: "Maroon / Khaki",             hex: "#6b2233", hex2: "#b59b6a" },
  { name: "Maroon / White",             hex: "#6b2233", hex2: "#f5f5f5" },
  { name: "Navy / Gray",                hex: "#13294b", hex2: "#9ea3a8" },
  { name: "Navy / Khaki",               hex: "#13294b", hex2: "#b59b6a" },
  { name: "Navy / Natural",             hex: "#13294b", hex2: "#e8dfc8" },
  { name: "Navy / White",               hex: "#13294b", hex2: "#f5f5f5" },
  { name: "Pink / Natural",             hex: "#f4b8c8", hex2: "#e8dfc8" },
  { name: "Red / Black",                hex: "#c8102e", hex2: "#111111" },
  { name: "Red / Gray",                 hex: "#c8102e", hex2: "#9ea3a8" },
  { name: "Red / Khaki",                hex: "#c8102e", hex2: "#b59b6a" },
  { name: "Red / Natural",              hex: "#c8102e", hex2: "#e8dfc8" },
  { name: "Red / Navy",                 hex: "#c8102e", hex2: "#13294b" },
  { name: "Red / Royal Blue",           hex: "#c8102e", hex2: "#1e4fa3" },
  { name: "Red / White",                hex: "#c8102e", hex2: "#f5f5f5" },
  { name: "Royal Blue / Black",         hex: "#1e4fa3", hex2: "#111111" },
  { name: "Royal Blue / Gray",          hex: "#1e4fa3", hex2: "#9ea3a8" },
  { name: "Royal Blue / Natural",       hex: "#1e4fa3", hex2: "#e8dfc8" },
  { name: "Royal Blue / White",         hex: "#1e4fa3", hex2: "#f5f5f5" },
  { name: "Sage Green / Natural",       hex: "#9caf88", hex2: "#e8dfc8" },
];

/** REAL colorways — OTTO 5 Panel Pro Style, confirmed against the client's photo drop. */
const OTTO_PRO_SOLIDS: CapColor[] = [
  { name: "Black",         hex: "#111111" },
  { name: "Charcoal Gray", hex: "#4a4a4a" },
  { name: "Coyote Brown",  hex: "#7a5c3a" },
  { name: "Dark Brown",    hex: "#4a3728" },
  { name: "Gray",          hex: "#9ea3a8" },
  { name: "Khaki",         hex: "#b59b6a" },
  { name: "Navy",          hex: "#13294b" },
  { name: "Red",           hex: "#c8102e" },
  { name: "Royal Blue",    hex: "#1e4fa3" },
  { name: "White",         hex: "#f5f5f5" },
];

/**
 * REAL colorways — OTTO 6 Panel Low Profile Dad Hat, confirmed against the
 * client's photo drop. 21 solids followed by 8 contrast two-tones.
 */
const OTTO_DAD_COLORS: CapColor[] = [
  { name: "Azalea",         hex: "#e87ba8" },
  { name: "Black",          hex: "#111111" },
  { name: "Bright Yellow",  hex: "#ffd400" },
  { name: "Brown",          hex: "#4a3728" },
  { name: "Charcoal Gray",  hex: "#4a4a4a" },
  { name: "Dark Green",     hex: "#1f4a2c" },
  { name: "Khaki",          hex: "#b59b6a" },
  { name: "Lake Blue",      hex: "#4a90c4" },
  { name: "Lime",           hex: "#a6ce39" },
  { name: "Maroon",         hex: "#6b2233" },
  { name: "Navy",           hex: "#13294b" },
  { name: "Olive Green",    hex: "#6b6b2a" },
  { name: "Orange",         hex: "#f5821f" },
  { name: "Pink",           hex: "#f4b8c8" },
  { name: "Purple",         hex: "#5b2d8e" },
  { name: "Red",            hex: "#c8102e" },
  { name: "Royal Blue",     hex: "#1e4fa3" },
  { name: "Sky Blue",       hex: "#87ceeb" },
  { name: "Stone Gray",     hex: "#b8b8b0" },
  { name: "White",          hex: "#f5f5f5" },
  { name: "Yellow",         hex: "#f5c518" },

  { name: "Black / Gray",   hex: "#111111", hex2: "#9ea3a8" },
  { name: "Black / Khaki",  hex: "#111111", hex2: "#b59b6a" },
  { name: "Green / Khaki",  hex: "#1f5f3b", hex2: "#b59b6a" },
  { name: "Khaki / Navy",   hex: "#b59b6a", hex2: "#13294b" },
  { name: "Navy / Gray",    hex: "#13294b", hex2: "#9ea3a8" },
  { name: "Navy / Khaki",   hex: "#13294b", hex2: "#b59b6a" },
  { name: "Olive / Khaki",  hex: "#6b6b2a", hex2: "#b59b6a" },
  { name: "Red / Black",    hex: "#c8102e", hex2: "#111111" },
];

/**
 * REAL colorways — Pitbull PB311 Hybrid 5 Panel Perforated Rope, confirmed
 * against the client's photo drop. `hex` is the crown, `hex2` the bill/rope.
 * "Neon Green" is the one solid in the range.
 */
const PB311_COLORS: CapColor[] = [
  { name: "Aqua / White",     hex: "#4dd0c4", hex2: "#f5f5f5" },
  { name: "Black / Black",    hex: "#111111", hex2: "#111111" },
  { name: "Black / White",    hex: "#111111", hex2: "#f5f5f5" },
  { name: "Burgundy / Black", hex: "#6b2233", hex2: "#111111" },
  { name: "Gray / Black",     hex: "#9ea3a8", hex2: "#111111" },
  { name: "Navy / Red",       hex: "#13294b", hex2: "#c8102e" },
  { name: "Navy / White",     hex: "#13294b", hex2: "#f5f5f5" },
  { name: "Neon Green",       hex: "#b5e61d" },
  { name: "Olive / Black",    hex: "#6b6b2a", hex2: "#111111" },
  { name: "Olive / Gold",     hex: "#6b6b2a", hex2: "#c9a227" },
  { name: "Tan / Black",      hex: "#d2b48c", hex2: "#111111" },
  { name: "Tan / White",      hex: "#d2b48c", hex2: "#f5f5f5" },
];

const COLORS_BY_STYLE: Record<string, CapColor[]> = {
  "lonestar-elite-hydro": [
    { name: "Navy / Navy White Rope",               hex: "#1e2a4a" },
    { name: "Black / Black White Rope",             hex: "#1a1a1a" },
    { name: "Black on Black",                       hex: "#141414" },
    { name: "Charcoal Grey / Grey White Rope",      hex: "#7c8285" },
    { name: "Charcoal Grey / Pink White Rope",      hex: "#7c8285" },
    { name: "Charcoal Grey / Red Black Retro Rope", hex: "#8a8f91" },
    { name: "Grey / Black",                         hex: "#8a8f91", hex2: "#1a1a1a" },
    { name: "Royal / Royal White Rope",             hex: "#1155cc" },
    { name: "White / Black",                        hex: "#eceded", hex2: "#1a1a1a" },
    { name: "White / Neon Pink White Rope",         hex: "#fdfdfd" },
    { name: "White / Wide Holes",                   hex: "#f7f7f5" },
  ],
  "lonestar-gameday-hydro": [
    { name: "Navy / Black Diamond Rope",       hex: "#1e2a44" },
    { name: "Black / Wide Holes",              hex: "#1a1a1a" },
    { name: "Charcoal / Charcoal White Rope",  hex: "#5a5f5e" },
    { name: "Charcoal / White Black Rope",     hex: "#5a5f5e" },
    { name: "Grey / Black Snapback",           hex: "#7d8482", hex2: "#1a1a1a" },
    { name: "Grey Black / Black White Rope",   hex: "#7d8482", hex2: "#1a1a1a" },
    { name: "Light Grey / White Diamond Rope", hex: "#c9cdc8" },
    { name: "Navy / Navy White Rope",          hex: "#1e2a44" },
    { name: "Tan / Black Rope",                hex: "#b08d5f" },
    { name: "White / Black White Rope",        hex: "#ecebe7" },
    { name: "White / Wide Holes",              hex: "#fdfdfd" },
  ],
  "otto-5-panel-aframe":  [...OTTO_AFRAME_SOLIDS, ...OTTO_AFRAME_CROWN_SPLIT],
  "otto-5-panel-pro":     OTTO_PRO_SOLIDS,
  "otto-6-panel-dad":     OTTO_DAD_COLORS,
  "otto-6-panel-trucker": OTTO_TRUCKER_COLORS,

  "pb311":   PB311_COLORS,
  "pb301":   PB301_COLORS,
  // REAL colorways — PB274C Cambridge Two Tone Camo, read off the client's photo
  // drop (2026-08-09). Cream crown on every one; only the camo bill changes —
  // the reverse of the old placeholders, which had a camo crown. `hex` = crown,
  // `hex2` = the bill's dominant tone, both sampled from the photos.
  "pb274c": [
    { name: "Cream / Cream Camo",  hex: "#d6d0ca", hex2: "#62594e" },
    { name: "Cream / Khaki Camo",  hex: "#d6d0ca", hex2: "#7c6e55" },
    { name: "Cream / Green Camo",  hex: "#d6d0ca", hex2: "#554233" },
    { name: "Cream / Olive Camo",  hex: "#d6d0ca", hex2: "#4a4334" },
    { name: "Cream / Navy Camo",   hex: "#d6d0ca", hex2: "#2e2f31" },
    { name: "Cream / Orange Camo", hex: "#d6d0ca", hex2: "#b45f27" },
    { name: "Cream / Tree Camo",   hex: "#d6d0ca", hex2: "#797562" },
    { name: "Cream / Tree Camo 2", hex: "#d6d0ca", hex2: "#4c4839" },
  ],
  // REAL colorways — PB275 Cambridge High Frame Meshback, read off the client's
  // photo drop (2026-08-09). Cream crown and cream mesh on every one; only the
  // bill (and matching button) changes. `hex` = crown, `hex2` = bill, sampled
  // from the photos. Same Cambridge cream as pb274c.
  "pb275": [
    { name: "Cream / Black",    hex: "#d6d0ca", hex2: "#121212" },
    { name: "Cream / Gray",     hex: "#d6d0ca", hex2: "#948d85" },
    { name: "Cream / Navy",     hex: "#d6d0ca", hex2: "#212437" },
    { name: "Cream / Green",    hex: "#d6d0ca", hex2: "#1d5941" },
    { name: "Cream / Brown",    hex: "#d6d0ca", hex2: "#3a251f" },
    { name: "Cream / Burgundy", hex: "#d6d0ca", hex2: "#73141d" },
    { name: "Cream / Red",      hex: "#d6d0ca", hex2: "#d5141e" },
    { name: "Cream / Purple",   hex: "#d6d0ca", hex2: "#433174" },
  ],
  // REAL colorways — PB136K Cambridge Two Tone Dad Hat, read off the client's
  // photo drop (2026-08-09). Khaki crown on every one; only the bill changes.
  // `hex` = crown, `hex2` = bill, both sampled from the photos.
  "pb136k": [
    { name: "Khaki / Black",       hex: "#c3b29c", hex2: "#2f2b27" },
    { name: "Khaki / Navy",        hex: "#c3b29c", hex2: "#3d4146" },
    { name: "Khaki / Brown",       hex: "#c3b29c", hex2: "#473129" },
    { name: "Khaki / Green",       hex: "#c3b29c", hex2: "#385d50" },
    { name: "Khaki / Olive",       hex: "#c3b29c", hex2: "#544c3a" },
    { name: "Khaki / Red",         hex: "#c3b29c", hex2: "#783838" },
    { name: "Khaki / Dark Denim",  hex: "#c3b29c", hex2: "#4d525c" },
    { name: "Khaki / Light Denim", hex: "#c3b29c", hex2: "#7e92a6" },
  ],
  "pb222": TWO_TONES,
};

/** Short marketing blurb per style, shown under the tab selector. */
const DESCRIPTIONS: Record<string, string> = {
  "lonestar-elite-hydro":
    "Curved bill snapback with a breathable mesh back for airflow, an adjustable snapback closure that fits any head size, and a lightweight, durable build made for all-day wear.",
  "lonestar-gameday-hydro":
    "6 panel flat bill snapback with a breathable mesh back for airflow, an adjustable snapback closure that fits any head size, and a lightweight, durable build made for all-day wear.",
  "otto-5-panel-aframe":  "Structured 5-panel A-frame with a tall front panel, the cleanest surface for a bold front logo.",
  "otto-5-panel-pro":     "Classic pro-style profile with a structured crown and a timeless fit.",
  "otto-6-panel-dad":     "Unstructured low-profile dad hat with a relaxed, broken-in feel.",
  "otto-6-panel-trucker": "Mid-profile trucker with a breathable mesh back and structured front.",

  "pb311":   "Hybrid 5-panel with perforated side panels and a rope accent across the brim.",
  "pb301":   "Hybrid crown with laser-perforated side panels and a speckled rope across the brim.",
  "pb274c":  "5-panel high-frame with a clean cream crown and a camo bill — the crown stays a solid surface for a front logo.",
  "pb275":   "High-frame 5-panel with a cream crown and mesh back, finished with a contrast bill.",
  "pb136k":  "Unstructured low-profile dad hat with a khaki crown and a contrast bill.",
  "pb222":   "Cambridge mesh trucker with a classic snapback fit.",
};

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getColors(styleId: string): CapColor[] {
  return COLORS_BY_STYLE[styleId] ?? SOLIDS;
}

export function getDescription(styleId: string): string {
  return DESCRIPTIONS[styleId] ?? "";
}

/**
 * Conventional public path for a cap photo. The file may not exist yet —
 * callers fall back to a color chip on load error.
 *
 * PNG because the client removes backgrounds before handing images over.
 */
export function capImage(styleId: string, colorName: string, angle: PreviewAngle): string {
  return `/images/caps/${styleId}/${slugify(colorName)}-${angle}.png`;
}

/**
 * Which colorway/angle represents a style in the tab selector and hero grid.
 * Falls back to the first color's front shot when a style has no override.
 */
const STYLE_PREVIEW: Record<string, { color: string; angle: PreviewAngle }> = {
  "lonestar-elite-hydro":   { color: "Navy / Navy White Rope", angle: "front" },
  "lonestar-gameday-hydro": { color: "Navy / Black Diamond Rope", angle: "front" },
  "otto-5-panel-aframe": { color: "White", angle: "side" },
  "otto-5-panel-pro":    { color: "White", angle: "side" },
  "otto-6-panel-dad":    { color: "White", angle: "front" },  // no side photos for this style
  "otto-6-panel-trucker":{ color: "White", angle: "side" },
  "pb311":               { color: "Black / White", angle: "front" },
  "pb136k":              { color: "Khaki / Black", angle: "front" },  // no side photos for this style
  "pb274c":              { color: "Cream / Green Camo", angle: "front" },  // front only
  "pb301":               { color: "Black", angle: "front" },  // no side photos for this style
  "pb275":               { color: "Cream / Black", angle: "front" },  // front only
};

/** Representative photo for a style. The file may not exist yet. */
export function stylePreviewImage(styleId: string): string {
  const override = STYLE_PREVIEW[styleId];
  if (override) return capImage(styleId, override.color, override.angle);
  const first = getColors(styleId)[0];
  return capImage(styleId, first.name, "front");
}

export type CatalogEntry = CapStyle & {
  description: string;
  colors:      CapColor[];
};

export const CAP_CATALOG: CatalogEntry[] = CAP_STYLES.map((style) => ({
  ...style,
  description: getDescription(style.id),
  colors:      getColors(style.id),
}));

export function getCatalogEntry(styleId: string): CatalogEntry | undefined {
  return CAP_CATALOG.find((entry) => entry.id === styleId);
}
