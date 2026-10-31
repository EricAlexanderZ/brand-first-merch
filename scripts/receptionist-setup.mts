/**
 * Creates or updates the AI receptionist in Retell, and points the business
 * phone number at it.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/receptionist-setup.mts
 *
 * Reads .env.local. Needs RETELL_API_KEY and RETELL_PHONE_NUMBER. Optional:
 * RETELL_VOICE_AGENT_ID / RETELL_SMS_AGENT_ID (update these agents instead of
 * creating new ones), OWNER_MOBILE (summaries and live transfers), and
 * RETELL_VOICE_ID (otherwise the agent keeps the voice picked in the dashboard).
 *
 * Each run writes the config from lib/receptionist/agent-config.ts into a new
 * draft version of each agent, publishes it, and pins the phone number to it.
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

type Agent = {
  agent_id: string;
  version: number;
  is_published: boolean;
  voice_id?: string;
  response_engine: { type: string; llm_id: string; version: number };
};

/**
 * Writes one agent and its LLM, publishes, and returns the published version.
 *
 * Retell versions agents (2026): a published version and its LLM are locked,
 * so an edit goes into a new draft made with create-*-version, whose LLM is
 * then edited at that version number, and the draft is published.
 */
async function deploy(opts: {
  kind: string;
  agentId?: string;
  chat: boolean;
  llmConfig: object;
  agentConfig: (llmId: string, current?: Agent) => Record<string, unknown>;
}): Promise<{ agentId: string; llmId: string; version: number }> {
  const p = opts.chat
    ? { get: "/get-chat-agent", create: "/create-chat-agent", update: "/update-chat-agent", draft: "/create-agent-version" }   // one draft endpoint serves both kinds
    : { get: "/get-agent", create: "/create-agent", update: "/update-agent", draft: "/create-agent-version" };

  let draft: Agent;
  if (!opts.agentId) {
    const { llm_id } = await retell<{ llm_id: string }>("/create-retell-llm", opts.llmConfig);
    draft = await retell<Agent>(p.create, opts.agentConfig(llm_id));
    console.log(`  created ${opts.kind} ${draft.agent_id}`);
  } else {
    const current = await retell<Agent>(`${p.get}/${opts.agentId}`, undefined, "GET");
    draft = current.is_published
      ? await retell<Agent>(`${p.draft}/${opts.agentId}`, { base_version: current.version })
      : current;
    const { llm_id, version: llmVersion } = draft.response_engine;
    await retell(`/update-retell-llm/${llm_id}?version=${llmVersion}`, opts.llmConfig, "PATCH");
    await retell(`${p.update}/${opts.agentId}`, {
      ...opts.agentConfig(llm_id, current),
      response_engine: { type: "retell-llm", llm_id, version: llmVersion },
    }, "PATCH");
    console.log(`  updated ${opts.kind} ${opts.agentId} (draft version ${draft.version})`);
  }

  await retell(`/publish-agent-version/${draft.agent_id}`, { version: draft.version });
  console.log(`  published ${opts.kind} version ${draft.version}`);
  return { agentId: draft.agent_id, llmId: draft.response_engine.llm_id, version: draft.version };
}

console.log("Setting up the Brand First Merch receptionist…");

const voice = await deploy({
  kind: "voice agent",
  agentId: env.RETELL_VOICE_AGENT_ID,
  chat: false,
  llmConfig: voiceLlmConfig(env.OWNER_MOBILE),
  // The voice is picked by ear in the dashboard; keep it unless told otherwise.
  agentConfig: (llmId, current) =>
    voiceAgentConfig(llmId, env.RETELL_VOICE_ID || current?.voice_id || "retell-Cimo"),
});

const sms = await deploy({
  kind: "text agent",
  agentId: env.RETELL_SMS_AGENT_ID,
  chat: true,
  llmConfig: smsLlmConfig(),
  agentConfig: (llmId) => smsAgentConfig(llmId),
});

const numberPath = `/update-phone-number/${encodeURIComponent(phone)}`;
const voiceAgents = { inbound_agents: [{ agent_id: voice.agentId, agent_version: voice.version, weight: 1 }] };
try {
  await retell(numberPath, {
    ...voiceAgents,
    inbound_sms_agents:  [{ agent_id: sms.agentId, agent_version: sms.version, weight: 1 }],
    outbound_sms_agents: [{ agent_id: sms.agentId, agent_version: sms.version, weight: 1 }],
  }, "PATCH");
  console.log(`  ${phone} now answers calls and texts`);
} catch (err) {
  // Retell refuses SMS agents on a number until its texting (A2P 10DLC)
  // application exists. Connect calls now; run this again once texting is
  // approved and the SMS agents attach then.
  if (!/a2p/i.test(String(err))) throw err;
  await retell(numberPath, voiceAgents, "PATCH");
  console.log(`  ${phone} now answers calls. Texting is not approved yet; run this again once it is.`);
}

console.log(`
Make sure .env.local and Vercel (Settings > Environment Variables) have:

RETELL_VOICE_AGENT_ID=${voice.agentId}
RETELL_SMS_AGENT_ID=${sms.agentId}
`);
