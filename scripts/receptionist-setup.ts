/**
 * Creates or updates the AI receptionist in Retell, and points the business
 * phone number at it.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/receptionist-setup.ts
 *
 * Reads .env.local. Needs RETELL_API_KEY and RETELL_PHONE_NUMBER; OWNER_MOBILE
 * and RETELL_VOICE_ID are optional. The first run creates four things in
 * Retell (a voice brain and agent, a text brain and agent) and prints their
 * ids; add those to .env.local and to Vercel so later runs update them in
 * place instead of creating duplicates.
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^"(.*)"$/, "$1");
}

const { retell } = await import("@/lib/receptionist/retell");
const { voiceLlmConfig, voiceAgentConfig, smsLlmConfig, smsAgentConfig } = await import(
  "@/lib/receptionist/agent-config"
);

const env = process.env;
const phone = env.RETELL_PHONE_NUMBER;
if (!env.RETELL_API_KEY || !phone) {
  console.error("Set RETELL_API_KEY and RETELL_PHONE_NUMBER in .env.local first.");
  process.exit(1);
}

async function upsert(kind: string, id: string | undefined, createPath: string, updatePath: string, body: object, idField: string) {
  if (id) {
    await retell(`${updatePath}/${id}`, body, "PATCH");
    console.log(`  updated ${kind} ${id}`);
    return id;
  }
  const created = await retell<Record<string, string>>(createPath, body);
  console.log(`  created ${kind} ${created[idField]}`);
  return created[idField];
}

console.log("Setting up the Brand First Merch receptionist…");

const voiceLlm = await upsert("voice brain", env.RETELL_VOICE_LLM_ID, "/create-retell-llm", "/update-retell-llm",
  voiceLlmConfig(env.OWNER_MOBILE), "llm_id");

// The voice is chosen by ear in the Retell dashboard, not in code. When
// updating an existing agent, keep whatever voice it has unless
// RETELL_VOICE_ID says otherwise, so re-running this never swaps the voice.
let voiceId = env.RETELL_VOICE_ID;
if (!voiceId && env.RETELL_VOICE_AGENT_ID) {
  const existing = await retell<{ voice_id: string }>(`/get-agent/${env.RETELL_VOICE_AGENT_ID}`, undefined, "GET");
  voiceId = existing.voice_id;
  console.log(`  keeping the agent's voice: ${voiceId}`);
}
const voiceAgent = await upsert("voice agent", env.RETELL_VOICE_AGENT_ID, "/create-agent", "/update-agent",
  voiceAgentConfig(voiceLlm, voiceId || "retell-Cimo"), "agent_id");

const smsLlm = await upsert("text brain", env.RETELL_SMS_LLM_ID, "/create-retell-llm", "/update-retell-llm",
  smsLlmConfig(), "llm_id");
const smsAgent = await upsert("text agent", env.RETELL_SMS_AGENT_ID, "/create-chat-agent", "/update-chat-agent",
  smsAgentConfig(smsLlm), "agent_id");

// Publish, so the phone number runs this version rather than a draft.
await retell(`/publish-agent/${voiceAgent}`, {});
await retell(`/publish-chat-agent/${smsAgent}`, {});
console.log("  published both agents");

await retell(`/update-phone-number/${encodeURIComponent(phone)}`, {
  inbound_agents:      [{ agent_id: voiceAgent, weight: 1 }],
  inbound_sms_agents:  [{ agent_id: smsAgent, weight: 1 }],
  outbound_sms_agents: [{ agent_id: smsAgent, weight: 1 }],
}, "PATCH");
console.log(`  ${phone} now answers calls and texts`);

console.log(`
Add these to .env.local and to Vercel (Settings > Environment Variables):

RETELL_VOICE_LLM_ID=${voiceLlm}
RETELL_VOICE_AGENT_ID=${voiceAgent}
RETELL_SMS_LLM_ID=${smsLlm}
RETELL_SMS_AGENT_ID=${smsAgent}
`);
