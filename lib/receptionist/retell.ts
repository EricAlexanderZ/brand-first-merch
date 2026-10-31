// Server use only: it holds the Retell API key.
import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.retellai.com";
const FIVE_MINUTES = 5 * 60 * 1000;

function apiKey(): string {
  const key = process.env.RETELL_API_KEY;
  if (!key) throw new Error("RETELL_API_KEY is not set");
  return key;
}

/** Calls the Retell REST API and returns the parsed JSON, or throws with its message. */
export async function retell<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
  method = "POST"
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`Retell ${method} ${path} failed (${res.status}): ${data?.message ?? text}`);
  }
  return data as T;
}

/**
 * Checks that a request really came from Retell.
 *
 * Retell signs every webhook and tool call: the X-Retell-Signature header is
 * "v=<ms timestamp>,d=<hex HMAC-SHA256 of rawBody + timestamp>", keyed with the
 * API key that has the webhook badge. Without this check, anyone who found the
 * URL could post fake calls, fake leads, or make the shop text strangers.
 */
export function verifyRetellSignature(rawBody: string, header: string | null): boolean {
  const key = process.env.RETELL_API_KEY;
  if (!key || !header) return false;

  const match = /v=(\d+),d=([0-9a-f]+)/i.exec(header);
  if (!match) return false;
  const [, timestamp, digest] = match;
  if (Math.abs(Date.now() - Number(timestamp)) > FIVE_MINUTES) return false;

  const expected = createHmac("sha256", key).update(rawBody + timestamp).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(digest, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Digits only, last ten, for matching the same phone written different ways. */
export function phoneKey(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "").slice(-10);
}

/**
 * Sends one text from the business number.
 *
 * Retell only starts SMS conversations through a chat agent, so the "texter"
 * agent's opening message is the template "{{message}}" and this fills it in.
 * If the customer replies, that same agent answers them. Contacts marked
 * do-not-contact in Retell are refused rather than texted.
 */
export async function sendText(
  to: string,
  message: string,
  metadata: Record<string, string> = {}
): Promise<{ ok: true; chatId: string } | { ok: false; error: string }> {
  const from  = process.env.RETELL_PHONE_NUMBER;
  const agent = process.env.RETELL_SMS_AGENT_ID;
  if (!from || !agent) return { ok: false, error: "RETELL_PHONE_NUMBER or RETELL_SMS_AGENT_ID is not set" };

  try {
    const chat = await retell<{ chat_id: string }>("/create-sms-chat", {
      from_number: from,
      to_number: to,
      override_agent_id: agent,
      retell_llm_dynamic_variables: { message },
      metadata,
      honor_internal_dnc: true,
    });
    return { ok: true, chatId: chat.chat_id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
