import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { phoneKey, sendText } from "@/lib/receptionist/retell";
import { firstFollowup, secondFollowup } from "@/lib/receptionist/messages";

/**
 * Daily follow-up texts for callers who have not ordered yet.
 *
 * Runs once a day from Vercel Cron (vercel.json), late morning Texas time, so
 * nobody is texted at night. Each lead gets at most two follow-ups: one a day
 * after the call and one three days after. A lead stops getting texts as soon
 * as any of these is true:
 *   - an order arrives from the same phone number or email (marked won),
 *   - they opted out (STOP, or asked in words),
 *   - they never agreed to texts on the call,
 *   - the owner marked the lead won or lost in the admin.
 */

const HOUR = 60 * 60 * 1000;
const DAY  = 24 * HOUR;

export async function GET(req: Request) {
  // Vercel Cron sends this header when CRON_SECRET is set; nobody else can.
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 14 * DAY).toISOString();
  const { data: leads, error } = await supabaseAdmin
    .from("leads")
    .select("id, created_at, phone, email, name, product, followups_sent")
    .eq("status", "new")
    .eq("ok_to_text", true)
    .eq("opted_out", false)
    .eq("is_sales_lead", true)
    .lt("followups_sent", 2)
    .gte("created_at", since);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Recent orders, to spot leads that already bought.
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("order_number, customer_phone, customer_email, created_at")
    .gte("created_at", since);

  const report = { won: 0, sent: 0, failed: 0, waiting: 0 };

  for (const lead of leads ?? []) {
    const order = (orders ?? []).find(
      (o) =>
        o.created_at >= lead.created_at &&
        ((phoneKey(o.customer_phone) && phoneKey(o.customer_phone) === phoneKey(lead.phone)) ||
          (lead.email && o.customer_email?.toLowerCase() === lead.email.toLowerCase()))
    );
    if (order) {
      await supabaseAdmin
        .from("leads")
        .update({ status: "won", converted_order_number: order.order_number })
        .eq("id", lead.id);
      report.won++;
      continue;
    }

    // The job runs once a day, so "a day after" is really "the next morning":
    // a 3pm call is 20 hours old at the 11am run and should not wait another day.
    const age = Date.now() - new Date(lead.created_at).getTime();
    const due = lead.followups_sent === 0 ? age >= 16 * HOUR : age >= 64 * HOUR;
    if (!due) { report.waiting++; continue; }

    const message = lead.followups_sent === 0
      ? firstFollowup(lead.name, lead.product)
      : secondFollowup(lead.name, lead.product);
    const sent = await sendText(lead.phone, message, { lead_id: lead.id, kind: `followup_${lead.followups_sent + 1}` });

    if (sent.ok) {
      await supabaseAdmin
        .from("leads")
        .update({ followups_sent: lead.followups_sent + 1, last_followup_at: new Date().toISOString() })
        .eq("id", lead.id);
      report.sent++;
    } else {
      console.error(`[receptionist] follow-up to lead ${lead.id} failed:`, sent.error);
      // A carrier opt-out or do-not-contact block will never succeed; stop trying.
      if (/opt|unsubscrib|do.?not|dnc|blocked/i.test(sent.error)) {
        await supabaseAdmin.from("leads").update({ opted_out: true }).eq("id", lead.id);
      }
      report.failed++;
    }
  }

  return NextResponse.json(report);
}
