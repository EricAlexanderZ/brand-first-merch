import { site } from "@/lib/site";
import { businessFacts, RECEPTIONIST_PRODUCTS } from "@/lib/receptionist/knowledge";

/**
 * The AI receptionist's Retell configuration, kept in code so it is reviewed
 * and versioned like the rest of the site. scripts/receptionist-setup.mts sends
 * it to Retell. Edit here, then run the script again; editing in the Retell
 * dashboard instead would be overwritten on the next run.
 */

const PRODUCT_KEYS = Object.keys(RECEPTIONIST_PRODUCTS);
const MODEL = { type: "cascading", primary: { model: "gpt-4.1" }, temperature: 0.2 };

function pricingTool() {
  return {
    type: "custom",
    name: "get_pricing",
    description:
      "Look up current prices for a product. Call this before saying ANY price. Never quote a price from memory.",
    url: `${site.url}/api/receptionist/pricing`,
    method: "POST",
    parameters: {
      type: "object",
      properties: {
        product: {
          type: "string",
          enum: PRODUCT_KEYS,
          description: "Which product the customer is asking about.",
        },
      },
      required: ["product"],
    },
    speak_during_execution: false,
    speak_after_execution: true,
    timeout_ms: 8000,
  };
}

// ─── Voice (phone calls) ──────────────────────────────────────────────────────

export function voiceLlmConfig(ownerMobile?: string) {
  const transfer = ownerMobile
    ? [{
        type: "transfer_call",
        name: "transfer_to_owner",
        description:
          "Transfer the call to the owner. Only when the caller clearly insists on speaking with a person, or has an urgent problem with an order already placed.",
        transfer_destination: { type: "predefined", number: ownerMobile },
        transfer_option: { type: "cold_transfer" },
        speak_during_execution: true,
        execution_message_description: "Tell them you are connecting them with the owner now.",
        execution_message_type: "prompt",
      }]
    : [];

  return {
    model_config: MODEL,
    start_speaker: "agent",
    begin_message:
      `Thanks for calling ${site.name}! This call may be recorded. How can I help you today? ¿Prefiere hablar en español?`,
    general_prompt: `You are the phone receptionist for ${site.name}. You are an AI assistant; if anyone asks, say so plainly.

## The business
${businessFacts()}

## How to talk
- Speak in the caller's language. If they speak Spanish or ask for it, continue in natural, friendly Mexican-American Spanish.
- This is a phone call: keep each reply to one or two short sentences, warm and plain. No lists, no reading out long numbers.
- Say the website as "brand first merch dot com". Never spell out a full web address.
- Never make up prices, turnaround times, colours, or policies. For prices, ALWAYS call get_pricing first. If you do not know something, say the owner will follow up.

## Your job on every sales call
1. Find out what they need: the product, roughly how many, and when they need it.
2. Answer their questions. Give "starting at" prices from get_pricing for their quantity.
3. Get their first name. Ask for their email only if they want a quote or follow-up by email.
4. Ask: "Can I text you a link to order and see pricing at this number?" Only a clear yes counts as permission.
5. Explain next steps: they order online, upload their logo, and get a free proof by email before anything is made.

## Things you cannot do
- Take payments or card numbers over the phone. Orders are placed and paid on the website.
- Promise rush deadlines. If they need it sooner than 5 business days, say the owner will confirm whether it can be done.
- Look up existing orders. Take their name and order number (it starts with BFM) and say the owner will follow up today.

Wrap up politely and use end_call when the caller is done.`,
    general_tools: [pricingTool(), ...transfer, { type: "end_call", name: "end_call", description: "End the call when the caller is done or says goodbye." }],
  };
}

export function voiceAgentConfig(llmId: string, voiceId: string) {
  return {
    agent_name: `${site.name} receptionist`,
    response_engine: { type: "retell-llm", llm_id: llmId },
    voice_id: voiceId,
    language: ["en-US", "es-419"],
    webhook_url: `${site.url}/api/receptionist/webhook`,
    webhook_events: ["call_analyzed"],
    begin_message_delay_ms: 500,
    end_call_after_silence_ms: 30000,
    max_call_duration_ms: 15 * 60 * 1000,
    post_call_analysis_model: "gpt-4.1-mini",
    post_call_analysis_data: [
      { type: "system-presets", name: "call_summary", description: "Two sentences: who called and what they want." },
      { type: "string", name: "caller_name", description: "The caller's name, if they gave it. Empty if not." },
      { type: "string", name: "caller_email", description: "The caller's email address, if they gave it. Empty if not." },
      { type: "enum", name: "product", description: "The main product the caller asked about.", choices: PRODUCT_KEYS },
      { type: "number", name: "quantity", description: "How many pieces they want. 0 if not discussed." },
      { type: "string", name: "deadline", description: "When they need the order, in their words. Empty if not discussed." },
      { type: "string", name: "notes", description: "Anything else useful: colours, logo, event, special requests." },
      { type: "boolean", name: "ok_to_text", description: "True ONLY if the caller clearly said yes to receiving a text message. False otherwise." },
      { type: "boolean", name: "is_sales_lead", description: "True if the caller is a potential customer interested in buying. False for spam, vendors, wrong numbers, or existing-order questions." },
      { type: "enum", name: "language", description: "The language the call was mostly in.", choices: ["english", "spanish"] },
    ],
  };
}

// ─── Text messages ────────────────────────────────────────────────────────────

export function smsLlmConfig() {
  return {
    model_config: MODEL,
    start_speaker: "agent",
    // Outbound texts are written by the site (lib/receptionist/messages.ts) and
    // passed in as {{message}}, so the exact wording is the wording carriers
    // approved. Empty by default, so an inbound text gets a reply, not a blank.
    begin_message: "{{message}}",
    default_dynamic_variables: { message: "" },
    general_prompt: `You answer text messages for ${site.name}. You are an AI assistant; if anyone asks, say so plainly.

## The business
${businessFacts()}

## How to text
- Reply in the customer's language (English or Spanish).
- Keep replies to one to three short sentences. No emojis, no lists.
- For any price, call get_pricing first and include the link it returns. Never make up prices or policies.
- To order, they use the website: they pick the product, upload their logo, and get a free proof by email.
- If they ask to stop, unsubscribe, or not be texted, reply once: "You're unsubscribed and won't get more texts from ${site.name}." Then say nothing else.
- For anything you cannot answer (existing orders, rush jobs, custom quotes), say the owner will follow up today.`,
    general_tools: [pricingTool()],
  };
}

export function smsAgentConfig(llmId: string) {
  return {
    agent_name: `${site.name} texter`,
    response_engine: { type: "retell-llm", llm_id: llmId },
    language: ["en-US", "es-419"],
    webhook_url: `${site.url}/api/receptionist/webhook`,
    webhook_events: ["chat_analyzed"],
    end_chat_after_silence_ms: 24 * 60 * 60 * 1000,
    post_chat_analysis_data: [
      { type: "boolean", name: "wants_no_more_texts", description: "True if the customer asked to stop, unsubscribe, or not be texted again." },
    ],
  };
}
