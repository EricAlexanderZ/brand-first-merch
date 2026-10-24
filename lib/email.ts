import nodemailer from "nodemailer";
import { site } from "@/lib/site";

function getTransporter() {
  const user = process.env.EMAIL_USER?.trim();
  // Google displays app passwords as four spaced groups ("abcd efgh ijkl mnop")
  // and Gmail's SMTP rejects them with the spaces left in. Strip rather than
  // depend on whoever pastes it next remembering to.
  const pass = process.env.EMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Returns true when a message was actually handed to SMTP.
 *
 * It used to return undefined both when it sent and when it was unconfigured,
 * which made a missing EMAIL_USER indistinguishable from a successful send. A
 * warning is logged instead, so an unconfigured deployment says so in the logs
 * rather than looking like everything worked.
 */
async function send({ to, subject, html }: EmailPayload): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[email] EMAIL_USER / EMAIL_APP_PASSWORD not set. Nothing was sent to " + to
    );
    return false;
  }

  const from = process.env.EMAIL_USER;
  await transporter.sendMail({ from: `Brand First Merch <${from}>`, to, subject, html });
  return true;
}

// ─── Customer: order confirmation ────────────────────────────────────────────

export function sendOrderConfirmation({
  to,
  name,
  orderId,
  orderNumber,
  items,
  total,
}: {
  to: string;
  name: string;
  orderId: string;
  /** The BFM number the customer sees on the site; preferred when present. */
  orderNumber?: string;
  items: { productType: string; quantity: number; price: number }[];
  total: number;
}) {
  const ref = orderNumber ?? orderId.slice(0, 8).toUpperCase();
  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${i.productType} × ${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">$${i.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return send({
    to,
    subject: `Order Confirmed — Brand First Merch #${ref}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#13294b;padding:24px 32px;border-radius:16px 16px 0 0">
          <p style="color:#ffd84d;font-weight:900;font-size:20px;margin:0">BRAND FIRST MERCH</p>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #eee">
          <h1 style="font-size:24px;margin:0 0 8px">Order Confirmed!</h1>
          <p style="color:#555;margin:0 0 24px">Hi ${name}, your order has been received. We'll send you a design proof by email shortly.</p>

          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr style="background:#f6f6f4">
                <th style="padding:8px;text-align:left">Item</th>
                <th style="padding:8px;text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr>
                <td style="padding:12px 0;font-weight:700;font-size:16px">Total</td>
                <td style="padding:12px 0;font-weight:700;font-size:16px;text-align:right">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top:24px;background:#fff8e7;border-radius:12px;padding:16px;font-size:13px;color:#555">
            <p style="margin:0 0 8px"><strong>What happens next?</strong></p>
            <p style="margin:0 0 4px">✓ Our team will prepare your design proof and email it to you.</p>
            <p style="margin:0 0 4px">✓ Review and approve your proof — or request changes.</p>
            <p style="margin:0">✓ Production begins only after you approve.</p>
          </div>

          <p style="margin-top:24px;font-size:13px;color:#888">
            Questions? Reply to this email or contact us at ${site.email}
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Admin: new order notification ───────────────────────────────────────────

export function sendAdminNewOrderAlert({
  orderId,
  orderNumber,
  customerName,
  customerEmail,
  items,
  total,
}: {
  orderId: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  items: { productType: string; quantity: number }[];
  total: number;
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return Promise.resolve();

  const ref = orderNumber ?? orderId.slice(0, 8).toUpperCase();
  const itemList = items.map((i) => `${i.productType} × ${i.quantity}`).join(", ");

  return send({
    to: adminEmail,
    subject: `New Order #${ref} — ${customerName} — $${total.toFixed(2)}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="margin:0 0 16px">New Order Received</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#555">Order</td><td style="font-weight:700">#${ref}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Customer</td><td>${customerName}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Email</td><td>${customerEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Items</td><td>${itemList}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Total</td><td style="font-weight:700">$${total.toFixed(2)}</td></tr>
        </table>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/orders/${orderId}"
           style="display:inline-block;margin-top:20px;background:#13294b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
          View Order in Admin
        </a>
      </div>
    `,
  });
}

// ─── Admin: a paid order that could not be saved ─────────────────────────────

/**
 * Sends the shop everything about a paid order the database refused.
 *
 * The customer has been charged at this point, so this email is the only
 * record of what they bought. It carries the raw order, artwork links
 * included, so the order can be entered by hand.
 */
export function sendAdminOrderSaveFailure({
  order,
  reason,
}: {
  order: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    total?: number;
    paymentIntentId?: string;
  } & Record<string, unknown>;
  reason: string;
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return Promise.resolve(false);

  return send({
    to: adminEmail,
    subject: `ACTION NEEDED: paid order not saved — ${order.customerName ?? "unknown"} — ${Number(order.total ?? 0).toFixed(2)}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
        <h2 style="margin:0 0 8px;color:#b91c1c">A customer paid, but the order did not save</h2>
        <p style="margin:0 0 16px;color:#555">
          Enter this order by hand. The customer was told their payment went through and that
          you would email their order number.
        </p>
        <table style="font-size:14px;border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0;color:#555">Customer</td><td>${esc(order.customerName ?? "")}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#555">Email</td><td>${esc(order.customerEmail ?? "")}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#555">Phone</td><td>${esc(order.customerPhone ?? "")}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#555">Total</td><td>${Number(order.total ?? 0).toFixed(2)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#555">Stripe payment</td><td>${esc(order.paymentIntentId ?? "not recorded")}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#555">Error</td><td>${esc(reason)}</td></tr>
        </table>
        <p style="margin:20px 0 6px;font-weight:700">Full order</p>
        <pre style="white-space:pre-wrap;font-size:12px;background:#f6f6f4;padding:12px;border-radius:8px">${esc(JSON.stringify(order, null, 2))}</pre>
      </div>
    `,
  });
}

// ─── Customer: order status updates ──────────────────────────────────────────

/**
 * Minimal HTML escape for values that go into an email body.
 *
 * Customer names and order numbers are attacker-influenced free text. Without
 * this, a name containing markup would be rendered as markup by the mail
 * client.
 */
function esc(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Copy for each status that is worth telling the customer about.
 *
 * Two statuses are deliberately absent. `new` already triggers the order
 * confirmation, so notifying again would double up. `proof_approved` is the
 * customer's own action, and emailing someone to report what they just did is
 * noise.
 *
 * Membership of this map is the single definition of "notifies the customer";
 * statusNotifiesCustomer reads it rather than keeping a second list that could
 * drift out of step.
 */
const STATUS_EMAILS: Record<
  string,
  { subject: (orderNumber: string) => string; heading: string; body: string }
> = {
  proof_sent: {
    subject: (n) => `Your proof is ready, order ${n}`,
    heading: "Your proof is ready",
    body:
      "We have prepared a proof of your artwork. Please review every detail carefully, including spelling, colours, sizes and placement, and reply to let us know if you would like any changes. Nothing is made until you approve it.",
  },
  in_production: {
    subject: (n) => `Your order is in production, order ${n}`,
    heading: "Your order is being made",
    body:
      "Your proof is approved and your order has moved into production. We will let you know as soon as it is ready.",
  },
  shipped: {
    subject: (n) => `Your order is on its way, order ${n}`,
    heading: "Your order is on its way",
    body:
      "Your order is packed and on its way to you. If you need tracking details or have any questions, just reply to this email.",
  },
  complete: {
    subject: (n) => `Your order is complete, order ${n}`,
    heading: "Your order is complete",
    body:
      "Your order is complete. Thank you for choosing Brand First Merch. If anything is not right, reply to this email and we will make it right.",
  },
  cancelled: {
    subject: (n) => `Your order has been cancelled, order ${n}`,
    heading: "Your order has been cancelled",
    body:
      "Your order has been cancelled and you will not be charged. If this was not expected, reply to this email and we will sort it out.",
  },
};

/** True when moving to `status` should email the customer. */
export function statusNotifiesCustomer(status: string): boolean {
  return status in STATUS_EMAILS;
}

/**
 * Tell the customer their order moved to a new status.
 *
 * Resolves false when the status has no customer-facing copy or when no mail
 * provider is configured, so callers can report what actually happened instead
 * of assuming a send occurred.
 */
export async function sendOrderStatusUpdate({
  to,
  name,
  orderNumber,
  status,
  proofUrl,
}: {
  to: string;
  name: string;
  orderNumber: string;
  status: string;
  /** Set for proof_sent, so the customer can open the proof from the email. */
  proofUrl?: string;
}): Promise<boolean> {
  const copy = STATUS_EMAILS[status];
  if (!copy) return false;

  const safeName = esc(name || "there");
  const safeRef  = esc(orderNumber);

  const proofButton =
    status === "proof_sent" && proofUrl
      ? `<p style="margin:0 0 24px">
           <a href="${esc(proofUrl)}"
              style="display:inline-block;background:#13294b;color:#fff;text-decoration:none;
                     padding:12px 24px;border-radius:8px;font-weight:700;font-size:15px">
             View your proof
           </a>
         </p>`
      : "";

  return send({
    to,
    subject: copy.subject(orderNumber),
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                  max-width:560px;margin:0 auto;padding:32px 24px;color:#0f1c33">
        <div style="background:#13294b;border-radius:10px;padding:20px 24px;margin-bottom:28px">
          <p style="color:#ffd84d;font-weight:900;font-size:20px;margin:0;letter-spacing:-0.02em">
            BRAND FIRST MERCH
          </p>
          <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:4px 0 0;letter-spacing:0.14em">
            CUSTOM EMBROIDERY &amp; PRINTING
          </p>
        </div>

        <h1 style="font-size:22px;margin:0 0 6px">${esc(copy.heading)}</h1>
        <p style="color:#6b7280;font-size:13px;margin:0 0 20px">Order ${safeRef}</p>

        <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Hi ${safeName},</p>
        <p style="font-size:15px;line-height:1.6;margin:0 0 24px">${esc(copy.body)}</p>

        ${proofButton}

        <p style="font-size:14px;line-height:1.6;color:#4b5563;margin:0 0 4px">
          Questions? Reply to this email or text ${esc(site.phone)}.
        </p>
        <p style="font-size:12px;color:#6b7280;margin:24px 0 0;border-top:1px solid #dfe3e9;padding-top:16px">
          Brand First Merch &middot; ${esc(site.email)}
        </p>
      </div>
    `,
  });
}
