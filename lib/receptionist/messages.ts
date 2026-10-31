import { site } from "@/lib/site";
import { productLink } from "@/lib/receptionist/knowledge";

/**
 * Every text the receptionist sends, in one place.
 *
 * Carriers approve the texting campaign against sample messages, and texts
 * that drift from those samples can get the number suspended. Keep these in
 * line with the samples submitted in the A2P application. Each one names the
 * business and says how to opt out, which carriers require.
 */

const firstName = (name: string | null) => (name ?? "").trim().split(/\s+/)[0] || "there";
const STOP = "Reply STOP to opt out.";

/** Sent right after a call, when the caller agreed to a text. */
export function linkMessage(name: string | null, product: string | null): string {
  const { label, url } = productLink(product);
  return `Hi ${firstName(name)}, thanks for calling ${site.name}! Here's the link for ${label}, with pricing and ordering: ${url} Reply here with any questions. ${STOP}`;
}

/** Sent a day after the call if no order has come in. */
export function firstFollowup(name: string | null, product: string | null): string {
  const { label, url } = productLink(product);
  return `Hi ${firstName(name)}, it's ${site.name} following up on ${label}. Once you order we email a free proof, and nothing is made until you approve it: ${url} ${STOP}`;
}

/** Sent three days after the call if still no order. The last one. */
export function secondFollowup(name: string | null, product: string | null): string {
  const { label, url } = productLink(product);
  return `Hi ${firstName(name)}, just checking in from ${site.name}. Any questions about ${label}? Reply here, or order anytime at ${url} ${STOP}`;
}

/** Sent to the owner's cell after each call. */
export function ownerSummary(lead: {
  name: string | null;
  phone: string;
  product: string | null;
  quantity: number | null;
  deadline: string | null;
  summary: string | null;
}): string {
  const wants = [lead.product, lead.quantity ? `x${lead.quantity}` : null, lead.deadline ? `by ${lead.deadline}` : null]
    .filter(Boolean)
    .join(" ");
  return `New call: ${lead.name || "Unknown"} ${lead.phone}${wants ? ` wants ${wants}` : ""}. ${lead.summary ?? ""}`.slice(0, 600);
}
