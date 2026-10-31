import { supabaseAdmin } from "@/lib/supabase-admin";
import { productLink } from "@/lib/receptionist/knowledge";
import LeadStatus from "@/components/admin/lead-status";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  created_at: string;
  phone: string;
  name: string | null;
  email: string | null;
  product: string | null;
  quantity: number | null;
  deadline: string | null;
  summary: string | null;
  is_sales_lead: boolean;
  ok_to_text: boolean;
  opted_out: boolean;
  link_sent_at: string | null;
  followups_sent: number;
  converted_order_number: string | null;
  status: string;
};

function textingLabel(l: Lead): string {
  if (l.opted_out) return "Opted out";
  if (!l.ok_to_text) return "No texts";
  if (l.converted_order_number) return "Done";
  const parts = [l.link_sent_at ? "Link sent" : "Link not sent"];
  if (l.followups_sent) parts.push(`${l.followups_sent}/2 follow-ups`);
  return parts.join(" · ");
}

export default async function LeadsPage() {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const leads = (data ?? []) as Lead[];

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-extrabold">Leads</h1>
      <p className="mt-1 text-sm text-gray-500">
        Calls and texts handled by the AI receptionist. Mark a lead won or lost to stop its follow-up texts.
      </p>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load leads: {error.message}. If the table does not exist yet, run supabase/leads.sql in Supabase.
        </p>
      )}

      {!error && leads.length === 0 && (
        <p className="mt-6 rounded-xl bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
          No leads yet. They appear here after the receptionist takes a call.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {leads.map((l) => (
          <div key={l.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">
                  {l.name || "Unknown caller"}{" "}
                  <a href={`tel:${l.phone}`} className="font-normal text-[#13294b] underline">{l.phone}</a>
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(l.created_at).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" })}
                  {l.email ? ` · ${l.email}` : ""}
                </p>
              </div>
              <LeadStatus id={l.id} status={l.status} />
            </div>

            <p className="mt-3 text-sm">
              {l.is_sales_lead ? (
                <>
                  <span className="font-semibold">{l.product ? productLink(l.product).label : "Not sure yet"}</span>
                  {l.quantity ? ` × ${l.quantity}` : ""}
                  {l.deadline ? ` · needed ${l.deadline}` : ""}
                </>
              ) : (
                <span className="text-gray-500">Not a sales call</span>
              )}
            </p>
            {l.summary && <p className="mt-1 text-sm text-gray-600">{l.summary}</p>}

            <p className="mt-3 text-xs text-gray-500">
              Texts: {textingLabel(l)}
              {l.converted_order_number ? ` · Ordered ${l.converted_order_number}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
