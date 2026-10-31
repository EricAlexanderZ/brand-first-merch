import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAdminLeadAlert } from "@/lib/email";
import { sendText, verifyRetellSignature } from "@/lib/receptionist/retell";
import { linkMessage, ownerSummary } from "@/lib/receptionist/messages";

/**
 * Retell's webhook for the AI receptionist.
 *
 * call_analyzed (after every call): saves the caller as a lead, texts them the
 * product link if they agreed to texts, and tells the owner by email and text.
 * chat_analyzed (after a text conversation): records an opt-out.
 *
 * Retell retries a webhook it thinks failed, so the work is keyed on the call
 * id: a repeat delivery finds the lead already saved and does nothing.
 */

type Analysis = {
  caller_name?: string;
  caller_email?: string;
  product?: string;
  quantity?: number | string;
  deadline?: string;
  notes?: string;
  ok_to_text?: boolean;
  is_sales_lead?: boolean;
  language?: string;
  wants_no_more_texts?: boolean;
};

const clean = (v: unknown): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  return s && !/^(n\/?a|none|unknown|null)$/i.test(s) ? s : null;
};

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyRetellSignature(raw, req.headers.get("x-retell-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(raw) as {
    event: string;
    call?: {
      call_id: string;
      from_number?: string;
      direction?: string;
      call_analysis?: { call_summary?: string; custom_analysis_data?: Analysis };
    };
    chat?: {
      chat_id: string;
      metadata?: Record<string, string>;
      chat_analysis?: { custom_analysis_data?: Analysis };
    };
  };

  if (payload.event === "call_analyzed" && payload.call) {
    await handleCall(payload.call);
  } else if (payload.event === "chat_analyzed" && payload.chat) {
    await handleChat(payload.chat);
  }

  return new NextResponse(null, { status: 204 });
}

async function handleCall(call: {
  call_id: string;
  from_number?: string;
  direction?: string;
  call_analysis?: { call_summary?: string; custom_analysis_data?: Analysis };
}) {
  // Test calls from the Retell dashboard have no caller number; nothing to follow up.
  if (!call.from_number || call.direction === "outbound") return;

  const a = call.call_analysis?.custom_analysis_data ?? {};
  const qty = Number(a.quantity);
  const lead = {
    call_id:       call.call_id,
    source:        "call",
    phone:         call.from_number,
    name:          clean(a.caller_name),
    email:         clean(a.caller_email),
    product:       clean(a.product),
    quantity:      Number.isInteger(qty) && qty > 0 ? qty : null,
    deadline:      clean(a.deadline),
    notes:         clean(a.notes),
    summary:       clean(call.call_analysis?.call_summary),
    language:      clean(a.language),
    is_sales_lead: a.is_sales_lead !== false,
    ok_to_text:    a.ok_to_text === true,
  };

  // ignoreDuplicates: a retried webhook returns no row, and stops here.
  const { data, error } = await supabaseAdmin
    .from("leads")
    .upsert(lead, { onConflict: "call_id", ignoreDuplicates: true })
    .select("id");
  if (error) {
    console.error("[receptionist] could not save lead:", error);
  } else if (!data?.length) {
    return;
  }
  const leadId = data?.[0]?.id as string | undefined;

  // Text the caller their link, only with their consent on the call.
  let textStatus = "Not sent: caller did not agree to texts";
  if (lead.is_sales_lead && lead.ok_to_text) {
    const sent = await sendText(lead.phone, linkMessage(lead.name, lead.product), {
      lead_id: leadId ?? "",
      kind: "link",
    });
    textStatus = sent.ok ? "Sent the product link" : `Not sent: ${sent.error}`;
    if (sent.ok && leadId) {
      await supabaseAdmin.from("leads").update({ link_sent_at: new Date().toISOString() }).eq("id", leadId);
    }
  } else if (!lead.is_sales_lead) {
    textStatus = "Not sent: not a sales call";
  }

  // Tell the owner, by email always and by text when a cell number is set.
  const results = await Promise.allSettled([
    sendAdminLeadAlert({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      product: lead.product,
      quantity: lead.quantity,
      deadline: lead.deadline,
      notes: lead.notes,
      summary: lead.summary,
      isSalesLead: lead.is_sales_lead,
      textStatus,
    }),
    process.env.OWNER_MOBILE
      ? sendText(process.env.OWNER_MOBILE, ownerSummary(lead), { kind: "owner_summary" })
      : Promise.resolve(null),
  ]);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("[receptionist] owner notification failed:", r.reason);
  });
}

async function handleChat(chat: {
  chat_id: string;
  metadata?: Record<string, string>;
  chat_analysis?: { custom_analysis_data?: Analysis };
}) {
  const leadId = chat.metadata?.lead_id;
  if (!leadId) return;
  // Carriers block texts to anyone who replies STOP. This also catches
  // "please stop texting me" in plain words, which carriers do not.
  if (chat.chat_analysis?.custom_analysis_data?.wants_no_more_texts) {
    await supabaseAdmin.from("leads").update({ opted_out: true }).eq("id", leadId);
  }
}
