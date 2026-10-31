-- Leads captured by the AI receptionist (phone calls and text replies).
--
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Only the server (service role key) reads or writes this table; row level
-- security is on with no policies, so the public anon key cannot see it.

CREATE TABLE IF NOT EXISTS leads (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at             timestamptz NOT NULL DEFAULT now(),
  source                 text NOT NULL DEFAULT 'call',     -- call | sms
  call_id                text UNIQUE,                      -- Retell call id; makes webhook retries harmless
  phone                  text NOT NULL,
  name                   text,
  email                  text,
  product                text,                             -- hats | polos | shirts | safety_vests | ...
  quantity               integer,
  deadline               text,
  notes                  text,
  summary                text,
  language               text,
  is_sales_lead          boolean NOT NULL DEFAULT true,
  ok_to_text             boolean NOT NULL DEFAULT false,   -- caller agreed on the call to receive texts
  opted_out              boolean NOT NULL DEFAULT false,   -- replied STOP or asked not to be texted
  link_sent_at           timestamptz,
  followups_sent         integer NOT NULL DEFAULT 0,
  last_followup_at       timestamptz,
  converted_order_number text,                             -- set when an order from this phone/email arrives
  status                 text NOT NULL DEFAULT 'new'       -- new | won | lost
);

CREATE INDEX IF NOT EXISTS leads_phone_idx ON leads (phone);
CREATE INDEX IF NOT EXISTS leads_followup_idx ON leads (status, ok_to_text, opted_out, followups_sent);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
