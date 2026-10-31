import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";

// ─── Brand constants ─────────────────────────────────────────
// A sole proprietorship trading as Brand First Merch (there is no LLC). Kept
// in step with the name on the texting (A2P 10DLC) registration.
const COMPANY   = site.name;
const SITE      = "Brand First Merch";
const ADDRESS   = "Alton, TX";
const EMAIL     = site.email;
const UPDATED   = "October 31, 2026";

// ─── Shared primitives ────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 text-2xl font-bold tracking-tight text-black">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 text-lg font-semibold text-black">
      {children}
    </h3>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-sm leading-7 text-gray-700">
      {children}
    </p>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2 pl-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm leading-7 text-gray-700">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5b43d]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <hr className="my-8 border-black/10" />;
}

// ─── Page ─────────────────────────────────────────────────────

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#f6f6f4] text-black">
      <TopBanner />
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 py-20">

        {/* Header */}
        <div className="rounded-[2rem] bg-white p-10 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#e5b43d]">Legal</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {COMPANY} &mdash; Last updated: {UPDATED}
          </p>

          <div className="mt-6 rounded-xl bg-[#f9f6ee] px-5 py-4 text-sm text-gray-700">
            <p className="font-semibold">{COMPANY}</p>
            <p>{ADDRESS}</p>
            <p>
              Owner contact:{" "}
              <a href={`mailto:${EMAIL}`} className="text-[#13294b] underline">
                {EMAIL}
              </a>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="mt-8 rounded-[2rem] bg-white px-10 py-10 shadow-sm">

          {/* Intro */}
          <Prose>
            These Terms govern the use of {SITE} and any other related agreement or legal
            relationship with the Owner in a legally binding way. Capitalized words are defined in
            the relevant dedicated section of this document. The User must read this document
            carefully.
          </Prose>

          <Divider />

          {/* Introduction */}
          <SectionTitle>Introduction</SectionTitle>

          <SubTitle>This document</SubTitle>
          <Prose>
            This document is a legal agreement between you, the User, and {COMPANY}, the business
            providing {SITE}. It governs your use of our online properties and the services we
            provide. "Legal agreement" means that the terms of this agreement are binding on the
            relationship between you and us once you have accepted them.
          </Prose>
          <Prose>
            For simplicity, "User," "you," "your" and similar terms refer to you. "We," "our,"
            "us" and similar terms refer to {COMPANY}. "{SITE}" refers to our website and
            services. "Agreement" refers to this document, as amended from time to time. The
            Agreement is concluded in the English language.
          </Prose>

          <Divider />

          {/* Registration */}
          <SectionTitle>Registration, Content, and Prohibited Use</SectionTitle>

          <SubTitle>Registration</SubTitle>
          <Prose>
            In order to use the Service or any part of it, Users must register in a truthful and
            complete manner by providing all required data in the relevant registration form. Users
            must also accept the Privacy Policy and these Terms in full. Users are responsible for
            keeping their login credentials confidential.
          </Prose>
          <Prose>
            The Owner shall not be held responsible under any circumstances for loss, disclosure,
            theft, or unauthorized use of the User's access credentials by third parties, for
            whatever reason.
          </Prose>

          <SubTitle>Account Termination</SubTitle>
          <Prose>
            Registered Users may cancel their accounts at any time by contacting the Owner. The
            Owner reserves the right to suspend or terminate a User's account at any time and
            without notice if it believes that:
          </Prose>
          <BulletList items={[
            "The User has violated this Agreement;",
            "The User's access or use of the Service may result in injury to the Owner, other Users, or third parties;",
            "The use of " + SITE + " by the User may violate applicable law or regulation;",
            "An investigation by legal action or governmental involvement is underway;",
            "The account is deemed, at the Owner's sole discretion, to be inappropriate, offensive, or in violation of this Agreement.",
          ]} />

          <SubTitle>Content Available on {SITE}</SubTitle>
          <Prose>
            Content available on {SITE} is protected by applicable intellectual property laws and
            related international treaties. The Owner grants the User, for the duration of the
            Agreement, a personal, non-assignable, non-exclusive license for the use of such
            content solely for personal, non-commercial purposes and limited to the User's device.
          </Prose>
          <Prose>
            Users may not copy, download, share beyond permitted limits, modify, publish, transmit,
            sell, sublicense, edit, transfer, or create derivative works from content available on
            {" "}{SITE}, nor allow any third party to do so.
          </Prose>

          <SubTitle>Content Provided by the User</SubTitle>
          <Prose>
            Users are responsible for their own content and that of third parties they share
            through {SITE}. Users confirm they have all necessary consents from third parties whose
            data and/or content they share, and hereby indemnify the Owner for any liability or
            claim arising from illegal distribution of third-party content or unlawful use of the
            Service.
          </Prose>

          <Divider />

          {/* Forbidden Use */}
          <SectionTitle>Forbidden Use</SectionTitle>
          <Prose>The Service shall be used only in accordance with these Terms. Users may not:</Prose>
          <BulletList items={[
            "Reverse engineer, decompile, disassemble, modify, or create derivative works based on " + SITE + " or any portion of it;",
            "Circumvent any technology used by " + SITE + " or its licensors to protect accessible content;",
            "Copy, store, edit, or alter any content provided through " + SITE + " in any unauthorized way;",
            "Use any robot, spider, or automated means to access, scrape, or index any portion of " + SITE + ";",
            "Rent, lease, or sublicense " + SITE + ";",
            "Defame, harass, threaten, or violate the legal rights of others;",
            "Disseminate or publish content that is unlawful, obscene, defamatory, or inappropriate;",
            "Misappropriate any account in use by another User;",
            "Register or use the Service to approach Users to promote or sell products or services of any kind;",
            "Use " + SITE + " in any other improper manner that violates these Terms.",
          ]} />

          <Divider />

          {/* Terms of Sale */}
          <SectionTitle>Terms and Conditions of Sale</SectionTitle>

          <SubTitle>Purchase</SubTitle>
          <Prose>
            {SITE} offers custom embroidery products and services available upon placement of an
            order. Fees, turnaround times, and conditions for orders are specified on the relevant
            product pages.
          </Prose>

          <SubTitle>Methods of Payment</SubTitle>
          <Prose>
            {SITE} uses third-party tools for payment processing and does not store or access
            your payment card information in any way. Any declined payment costs shall be borne by
            the User.
          </Prose>

          <SubTitle>Offers and Discounts</SubTitle>
          <Prose>
            The Owner reserves the right, at its sole discretion, to offer discounts or promotions
            for a limited period of time. The conditions of such offers will be specified on the
            corresponding information page and are valid for the fixed term or, where applicable,
            while availability lasts.
          </Prose>

          <Divider />

          {/* Artwork Proofs */}
          <SectionTitle>Artwork Proofs &amp; Approval</SectionTitle>
          <Prose>
            All orders that include custom embroidery, artwork, or design work may require a
            digital proof to be reviewed by the User prior to production.
          </Prose>
          <Prose>
            It is the User's sole responsibility to carefully review all proofs for accuracy,
            including but not limited to spelling, grammar, sizing, dimensions, colors, placement,
            and overall design layout.
          </Prose>
          <Prose>
            Proofs are delivered electronically via email or through the {SITE} platform.
          </Prose>
          <Prose>
            <strong>If no approval or revision request is received within five (5) calendar
            days</strong> from the date the proof is sent, the proof shall be deemed automatically
            approved and the order will be released into production without further notice.
          </Prose>
          <BulletList items={[
            "Once a proof has been approved — whether manually or automatically — " + COMPANY + " shall not be held liable for any errors, omissions, or discrepancies contained within the approved proof.",
            "Any reprints, revisions, or corrections requested after approval will be treated as a new order and will be subject to additional charges.",
            "Delays in proof approval may result in adjusted production and delivery timelines. " + COMPANY + " is not responsible for missed deadlines caused by delayed proof approvals.",
            "Orders that enter production following proof approval are considered confirmed and are not eligible for cancellation, refund, or chargeback based on proof-related errors.",
          ]} />

          <Divider />

          {/* Refunds */}
          <SectionTitle>Refunds</SectionTitle>
          <Prose>
            {COMPANY} accepts requests for cancellation and refund only for the portion of Service
            not yet provided and within 14 days after payment. Fees paid are non-refundable if:
          </Prose>
          <BulletList items={[
            "The Service has already been provided at the time of the refund request;",
            "The order has entered production following proof approval.",
          ]} />

          <Divider />

          {/* Delivery */}
          <SectionTitle>Delivery</SectionTitle>
          <Prose>
            Deliveries are made to the address indicated by the User during checkout in the manner
            specified in the order summary. Upon delivery, the User must verify the contents and
            note any anomalies promptly.
          </Prose>
          <Prose>
            The Owner cannot be held responsible for errors in delivery due to inaccuracies or
            incompleteness in the User's shipping information, for damage occurring after delivery
            to the carrier, or for delays attributable to the carrier.
          </Prose>
          <Prose>
            In case of failure to collect products by the carrier's deadline, products will be
            returned to the Owner, who will refund the purchase price but not the shipping cost.
          </Prose>

          <Divider />

          {/* Text messaging terms. Carriers review this before approving the
              business texting number (A2P 10DLC). */}
          <SectionTitle>Text Messaging Terms</SectionTitle>
          <Prose>
            {SITE} texts are sent only to people who agree to receive them, usually when our
            automated phone assistant asks during a call. Texts relate to your inquiry: a link to
            the product you asked about and up to two follow-up messages. Message frequency varies.
            Message and data rates may apply. Reply STOP to cancel at any time; you will receive one
            confirmation and no further texts. Reply HELP for help, or email {EMAIL}. Carriers are
            not liable for delayed or undelivered messages. Consent to receive texts is not a
            condition of purchase.
          </Prose>

          <Divider />

          {/* Indemnification */}
          <SectionTitle>Indemnification and Limitation of Liability</SectionTitle>

          <SubTitle>Indemnity</SubTitle>
          <Prose>
            The User agrees to indemnify and hold {COMPANY} and its officers, directors, agents,
            partners, and employees harmless from and against any claim or demand — including
            reasonable legal fees — made by any third party due to or arising out of the User's
            content, use of or connection to the Service, violation of these Terms, or violation of
            any third-party rights.
          </Prose>

          <SubTitle>Limitations of Liability</SubTitle>
          <Prose>
            {SITE} and all functions accessible through it are made available without any warranty,
            express or implied, that is not required by law. In particular, there is no guarantee
            of suitability of the services offered for the User's specific goals.
          </Prose>
          <Prose>The Owner shall not be liable for:</Prose>
          <BulletList items={[
            "Any losses that are not a direct consequence of the breach of the Agreement by the Owner;",
            "Any loss of business opportunities or indirect losses incurred by the User;",
            "Damages resulting from interruptions or malfunctions due to acts of force majeure or events independent of the Owner's control, such as failures of telephone, electrical, or internet infrastructure, natural disasters, viruses, cyberattacks, or third-party service disruptions;",
            "Incorrect or unsuitable use of " + SITE + " by Users or third parties.",
          ]} />

          <Divider />

          {/* Miscellaneous */}
          <SectionTitle>Miscellaneous</SectionTitle>

          <SubTitle>Service Interruption</SubTitle>
          <Prose>
            The Owner reserves the right to interrupt the Service for maintenance or system
            updates, informing Users through notices published on {SITE}.
          </Prose>

          <SubTitle>Service Reselling</SubTitle>
          <Prose>
            Users are not allowed to reproduce, duplicate, copy, sell, or exploit any portion of
            {" "}{SITE} or its Service without the Owner's prior written permission.
          </Prose>

          <SubTitle>Privacy Policy</SubTitle>
          <Prose>
            For information about the use of personal data, Users must refer to the Privacy Policy
            of {SITE}, which is hereby incorporated into these Terms.
          </Prose>

          <SubTitle>Intellectual Property Rights</SubTitle>
          <Prose>
            All trademarks, logos, trade names, service marks, illustrations, images, and related
            intellectual property appearing on {SITE} are and remain the exclusive property of
            {" "}{COMPANY} or its licensors and are protected by applicable trademark laws and
            international treaties.
          </Prose>

          <Divider />

          {/* DMCA */}
          <SectionTitle>Filing Claims Under DMCA</SectionTitle>
          <Prose>
            Under the Digital Millennium Copyright Act (DMCA), you may request that the Owner
            remove material that infringes a copyright. Your takedown notice must include:
          </Prose>
          <BulletList items={[
            "A physical or electronic signature of a person authorized to act on behalf of the copyright owner;",
            "Identification of the copyrighted work claimed to have been infringed;",
            "Identification of the allegedly infringing material and information sufficient to locate it;",
            "Contact information sufficient to permit the service provider to reach the complaining party;",
            "A statement of good faith belief that the use is not authorized by the copyright owner, its agent, or the law;",
            "A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the copyright owner.",
          ]} />
          <Prose>
            Send your takedown notice to:{" "}
            <a href={`mailto:${EMAIL}`} className="text-[#13294b] underline">
              {EMAIL}
            </a>
          </Prose>

          <Divider />

          {/* Changes */}
          <SectionTitle>Changes to These Terms</SectionTitle>
          <Prose>
            The Owner reserves the right to modify these Terms at any time by publishing a notice
            within {SITE}. Users who continue to use {SITE} after the publication of changes
            accept the new Terms in their entirety.
          </Prose>

          <SectionTitle>Assignment of Contract</SectionTitle>
          <Prose>
            The Owner reserves the right to transfer, assign, or subcontract all or any rights or
            obligations under these Terms, as long as the User's rights under the Terms are not
            affected. Users may not assign or transfer their rights or obligations without the
            Owner's written permission.
          </Prose>

          <SectionTitle>Severability</SectionTitle>
          <Prose>
            If any provision of these Terms is found invalid or unenforceable, that clause will be
            removed and the remaining provisions will remain in full force and effect.
          </Prose>

          <SectionTitle>Governing Law and Jurisdiction</SectionTitle>
          <Prose>
            These Terms are governed by and construed in accordance with the laws of the State of
            Texas, without regard to its conflict of law principles. Any dispute arising out of or
            in connection with these Terms shall be subject to the exclusive jurisdiction of the
            courts of the State of Texas.
          </Prose>

          <Divider />

          {/* Definitions */}
          <SectionTitle>Definitions and Legal References</SectionTitle>

          <SubTitle>{SITE} (or this Application)</SubTitle>
          <Prose>The property that enables the provision of the Service.</Prose>

          <SubTitle>Agreement</SubTitle>
          <Prose>
            Any legally binding or contractual relationship between the Owner and the User,
            governed by these Terms.
          </Prose>

          <SubTitle>Owner (or We)</SubTitle>
          <Prose>
            Indicates the legal entity that provides {SITE} and/or the Service to Users —{" "}
            {COMPANY}, {ADDRESS}.
          </Prose>

          <SubTitle>Service</SubTitle>
          <Prose>
            The custom embroidery ordering service provided by {SITE} as described in these Terms.
          </Prose>

          <SubTitle>Terms</SubTitle>
          <Prose>
            All provisions applicable to the use of {SITE} and/or the Service as described in this
            document, including any related documents or agreements, as updated from time to time.
          </Prose>

          <SubTitle>User (or You)</SubTitle>
          <Prose>
            Indicates any natural person or legal entity using {SITE}.
          </Prose>

          <Divider />

          {/* Withdrawal form */}
          <SectionTitle>Example Cancellation Form</SectionTitle>
          <Prose>To cancel an order or request a refund, contact us at:</Prose>
          <div className="mt-4 rounded-xl bg-[#f9f6ee] px-5 py-4 text-sm text-gray-700 space-y-1">
            <p className="font-semibold">{COMPANY}</p>
            <p>{ADDRESS}</p>
            <p>
              <a href={`mailto:${EMAIL}`} className="text-[#13294b] underline">
                {EMAIL}
              </a>
            </p>
          </div>
          <Prose>
            I/We hereby give notice that I/we withdraw from my/our contract of sale of the
            following goods or services:
          </Prose>
          <div className="mt-4 rounded-xl border border-black/10 px-5 py-5 text-sm text-gray-600 space-y-3">
            <p>Description of goods/services: ___________________________________</p>
            <p>Ordered on: ___________________________________</p>
            <p>Received on: ___________________________________</p>
            <p>Name of consumer(s): ___________________________________</p>
            <p>Address of consumer(s): ___________________________________</p>
            <p>Date: ___________________________________</p>
            <p className="italic">(Sign if submitting on paper)</p>
          </div>

          <Divider />

          {/* Footer note */}
          <p className="text-xs text-gray-400">
            Last updated: {UPDATED} &mdash; {COMPANY}, {ADDRESS}
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
