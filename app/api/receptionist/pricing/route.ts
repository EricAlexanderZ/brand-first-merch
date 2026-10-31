import { NextResponse } from "next/server";
import { verifyRetellSignature } from "@/lib/receptionist/retell";
import { pricingAnswer, productLink } from "@/lib/receptionist/knowledge";

/**
 * The get_pricing tool the AI receptionist calls during a call or text chat.
 *
 * Answers from the site's live pricing tables, so the AI never quotes from
 * memory and never quotes a price the site would not charge.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyRetellSignature(raw, req.headers.get("x-retell-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(raw) as { args?: { product?: string } };
  const product = body.args?.product ?? "other";

  return NextResponse.json({
    answer: pricingAnswer(product),
    link: productLink(product).url,
  });
}
