import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";

// ─── Brand constants ──────────────────────────────────────────
// The business as the owner registers it: a sole proprietorship trading as
// Brand First Merch (EIN on file; there is no LLC). Kept in step with the
// name on the texting (A2P 10DLC) registration, which carriers compare.
const COMPANY = site.name;
const SITE    = "Brand First Merch";
const ADDRESS = "Alton, TX";
const EMAIL   = site.email;
const UPDATED = "October 31, 2026";

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
        <li
          key={i}
          className="flex items-start gap-2 text-sm leading-7 text-gray-700"
        >
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5b43d]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ServiceBlock({
  name,
  description,
  dataTypes,
  location,
  privacyUrl,
}: {
  name: string;
  description: string;
  dataTypes: string;
  location?: string;
  privacyUrl?: string;
}) {
  return (
    <div className="mt-5 rounded-xl border border-black/10 bg-[#f9f6ee] p-5">
      <p className="text-sm font-bold">{name}</p>
      <p className="mt-1 text-sm leading-6 text-gray-700">{description}</p>
      <p className="mt-2 text-xs text-gray-500">
        <span className="font-semibold text-black">Personal Data:</span>{" "}
        {dataTypes}
      </p>
      {location && (
        <p className="mt-1 text-xs text-gray-500">
          <span className="font-semibold text-black">Place of processing:</span>{" "}
          {location}
          {privacyUrl && (
            <>
              {" "}–{" "}
              <a
                href={privacyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#13294b]"
              >
                Privacy Policy
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

function Divider() {
  return <hr className="my-8 border-black/10" />;
}

// ─── Page ─────────────────────────────────────────────────────

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#f6f6f4] text-black">
      <TopBanner />
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 py-20">

        {/* Header card */}
        <div className="rounded-[2rem] bg-white p-10 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#e5b43d]">Legal</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {COMPANY} &mdash; Last updated: {UPDATED}
          </p>

          <div className="mt-6 rounded-xl bg-[#f9f6ee] px-5 py-4 text-sm text-gray-700">
            <p className="font-semibold">{COMPANY}</p>
            <p>{ADDRESS}</p>
            <p>
              Owner contact:{" "}
              <a
                href={`mailto:${EMAIL}`}
                className="text-[#13294b] underline"
              >
                {EMAIL}
              </a>
            </p>
          </div>
        </div>

        {/* Body card */}
        <div className="mt-8 rounded-[2rem] bg-white px-10 py-10 shadow-sm">

          <Prose>
            This Privacy Policy describes how {COMPANY} ("we", "us", or "our") collects,
            uses, and shares information about you when you use our website and services. Please
            read this policy carefully.
          </Prose>

          <Divider />

          {/* Types of Data */}
          <SectionTitle>Types of Data Collected</SectionTitle>
          <Prose>
            Among the types of Personal Data that {SITE} collects, by itself or through third
            parties, there are: Cookies; Usage Data; email address; first name; last name; phone
            number; and various types of Data.
          </Prose>
          <Prose>
            Complete details on each type of Personal Data collected are provided in the dedicated
            sections of this privacy policy. Personal Data may be freely provided by the User or,
            in the case of Usage Data, collected automatically when using {SITE}.
          </Prose>
          <Prose>
            Unless specified otherwise, all Data requested by {SITE} is mandatory. Failure to
            provide this Data may make it impossible for {SITE} to provide its services. Users who
            are uncertain about which Personal Data is mandatory are welcome to contact the Owner.
          </Prose>
          <Prose>
            Users are responsible for any third-party Personal Data obtained, published, or shared
            through {SITE} and confirm that they have the third party's consent to provide the Data
            to the Owner.
          </Prose>

          <Divider />

          {/* Mode and place */}
          <SectionTitle>Mode and Place of Processing the Data</SectionTitle>

          <SubTitle>Methods of Processing</SubTitle>
          <Prose>
            The Owner takes appropriate security measures to prevent unauthorized access,
            disclosure, modification, or destruction of the Data. The Data processing is carried
            out using computers and/or IT-enabled tools, following organizational procedures
            strictly related to the purposes indicated. In addition to the Owner, certain types of
            persons involved in the operation of {SITE} — including administration, sales,
            marketing, legal, and system administration — or external parties (such as technical
            service providers, hosting providers, and communications agencies) may have access to
            the Data as Data Processors.
          </Prose>

          <SubTitle>Legal Basis of Processing</SubTitle>
          <Prose>
            The Owner may process Personal Data relating to Users if one of the following applies:
          </Prose>
          <BulletList items={[
            "Users have given their consent for one or more specific purposes.",
            "Provision of Data is necessary for the performance of an agreement with the User and/or for any pre-contractual obligations thereof.",
            "Processing is necessary for compliance with a legal obligation to which the Owner is subject.",
            "Processing is necessary for the purposes of the legitimate interests pursued by the Owner or by a third party.",
          ]} />

          <SubTitle>Place</SubTitle>
          <Prose>
            The Data is processed at the Owner's operating offices and in any other places where
            the parties involved in the processing are located. Depending on the User's location,
            data transfers may involve transferring the User's Data to a country other than their
            own.
          </Prose>

          <SubTitle>Retention Time</SubTitle>
          <Prose>
            Personal Data shall be processed and stored for as long as required by the purpose
            for which it was collected. Personal Data collected for performance of a contract shall
            be retained until the contract is fully performed. Once the retention period expires,
            Personal Data shall be deleted.
          </Prose>

          <Divider />

          {/* Purposes */}
          <SectionTitle>The Purposes of Processing</SectionTitle>
          <Prose>
            The Data concerning the User is collected to allow the Owner to provide its Service,
            comply with legal obligations, respond to enforcement requests, protect its rights and
            interests, detect malicious or fraudulent activity, and the following: Analytics,
            Contacting the User, Handling payments, Registration and authentication, Hosting and
            backend infrastructure, Tag Management, Remarketing and behavioral targeting, and User
            database management.
          </Prose>

          <Divider />

          {/* Detailed info */}
          <SectionTitle>Detailed Information on the Processing of Personal Data</SectionTitle>

          <SubTitle>Analytics</SubTitle>
          <Prose>
            These services enable the Owner to monitor and analyze web traffic and track User
            behavior.
          </Prose>
          <ServiceBlock
            name="Google Analytics (Google LLC)"
            description="Google Analytics is a web analysis service. Google utilizes the data collected to track and examine the use of Brand First Merch, prepare reports on its activities, and share these reports with other Google services."
            dataTypes="Cookies; Usage Data"
            location="United States"
            privacyUrl="https://policies.google.com/privacy"
          />
          <ServiceBlock
            name="Google Ads Conversion Tracking (Google LLC)"
            description="Google Ads conversion tracking is an analytics service that connects data from the Google Ads advertising network with actions performed on Brand First Merch."
            dataTypes="Cookies; Usage Data"
            location="United States"
            privacyUrl="https://policies.google.com/privacy"
          />

          <SubTitle>Tag Management</SubTitle>
          <ServiceBlock
            name="Google Tag Manager (Google LLC)"
            description="Google Tag Manager is a tag management service that allows Brand First Merch to deploy and manage analytics and marketing tags without modifying the codebase directly. It does not collect Personal Data itself but may trigger tags that do."
            dataTypes="Usage Data; Cookies; data collected by triggered tags"
            location="United States"
            privacyUrl="https://policies.google.com/privacy"
          />

          <SubTitle>Contacting the User</SubTitle>
          <ServiceBlock
            name={`Mailing List / Newsletter (${SITE})`}
            description={`By registering or making a purchase, the User's email address may be added to our mailing list to receive information of commercial or promotional nature concerning ${SITE}.`}
            dataTypes="Email address; first name; last name"
          />
          <ServiceBlock
            name={`Contact Form (${SITE})`}
            description={`By filling in the contact form, the User authorizes ${SITE} to use these details to reply to requests for information, quotes, or any other request as indicated by the form's header.`}
            dataTypes="Email address; first name; last name; phone number"
          />
          <ServiceBlock
            name="Postmark (ActiveCampaign, LLC)"
            description={`Postmark is an email delivery service that enables ${SITE} to send order confirmations, proof notifications, receipts, and other transactional emails.`}
            dataTypes="Email address; name; message metadata; delivery information"
            location="United States"
            privacyUrl="https://activecampaign.com/privacy/"
          />

          <SubTitle>Handling Payments</SubTitle>
          <Prose>
            Payment processing services enable {SITE} to process payments by credit card or other
            means. {SITE} shares only the information necessary to execute the transaction with the
            financial intermediaries handling it. {SITE} does not store payment card information.
          </Prose>
          <ServiceBlock
            name="Square (Block, Inc.)"
            description={`Square is a payment processing service used by ${SITE} to securely handle credit card transactions and other payments.`}
            dataTypes="Various types of Data as specified in the privacy policy of the service"
            location="United States"
            privacyUrl="https://squareup.com/us/en/legal/general/privacy"
          />

          <SubTitle>Registration and Authentication</SubTitle>
          <ServiceBlock
            name="Google OAuth (Google LLC)"
            description={`Google OAuth is a registration and authentication service that allows Users to sign in to ${SITE} using their Google account.`}
            dataTypes="Various types of Data as specified in the privacy policy of the service"
            location="United States"
            privacyUrl="https://policies.google.com/privacy"
          />

          <SubTitle>Hosting and Backend Infrastructure</SubTitle>
          <ServiceBlock
            name="Cloudflare (Cloudflare, Inc.)"
            description={`Cloudflare provides security and performance services for ${SITE}, including protection from malicious traffic, content delivery, and caching.`}
            dataTypes="IP address; browser and device information; usage data"
            location="United States"
            privacyUrl="https://www.cloudflare.com/privacypolicy/"
          />
          <ServiceBlock
            name="Google Cloud Storage (Google LLC)"
            description={`Google Cloud Storage is used by ${SITE} to securely store and manage user-uploaded artwork files and related assets.`}
            dataTypes="Uploaded images; file metadata"
            location="United States"
            privacyUrl="https://policies.google.com/privacy"
          />

          <SubTitle>Remarketing and Behavioral Targeting</SubTitle>
          <Prose>
            These services allow {SITE} and its partners to inform, optimize, and serve advertising
            based on past use of the Service by the User.
          </Prose>
          <ServiceBlock
            name="Google Ads Remarketing (Google LLC)"
            description="Google Ads Remarketing connects the activity of Brand First Merch with the Google Ads advertising network and the DoubleClick Cookie."
            dataTypes="Cookies; Usage Data"
            location="United States"
            privacyUrl="https://policies.google.com/privacy"
          />
          <ServiceBlock
            name="Facebook Custom Audience / Remarketing (Facebook, Inc.)"
            description="Facebook remarketing services connect the activity of Brand First Merch with the Facebook advertising network and allow for targeted advertising."
            dataTypes="Cookies; email address; Usage Data"
            location="United States"
            privacyUrl="https://www.facebook.com/policy.php"
          />

          <Divider />

          {/* Text messaging. Carriers review this wording before approving the
              business texting number (A2P 10DLC); keep the no-sharing sentences. */}
          <SectionTitle>Text Messaging (SMS)</SectionTitle>
          <Prose>
            When you call or text {SITE}, our automated assistant may ask whether we can text you.
            If you agree, we send texts about your inquiry, such as a link to the product you asked
            about, and up to two follow-up messages. Message frequency varies. Message and data
            rates may apply. Reply STOP to any message to opt out, or HELP for help, or contact us
            at {EMAIL}.
          </Prose>
          <Prose>
            No mobile information will be shared with third parties or affiliates for marketing or
            promotional purposes. Text messaging originator opt-in data and consent will not be
            shared with any third parties. Phone numbers are shared only with the service providers
            that deliver our calls and texts, solely to provide that service.
          </Prose>

          <Divider />

          {/* Cookie Policy */}
          <SectionTitle>Cookie Policy</SectionTitle>
          <Prose>
            {SITE} uses cookies and other tracking technologies ("Trackers") to support essential
            site functions, including storing session IDs and cart contents. These Trackers allow
            the website to remember user sessions, maintain shopping cart contents, and provide a
            consistent browsing experience. Some cookies are placed by third-party services that
            appear on our pages. You can manage cookie preferences through your browser settings.
          </Prose>

          <Divider />

          {/* User Rights */}
          <SectionTitle>The Rights of Users</SectionTitle>
          <Prose>
            Users may exercise certain rights regarding their Data processed by the Owner. In
            particular, Users have the right to:
          </Prose>
          <BulletList items={[
            "Withdraw their consent at any time where they have previously given consent to processing.",
            "Object to the processing of their Data if processing is carried out on a legal basis other than consent.",
            "Access their Data and learn if Data is being processed by the Owner.",
            "Verify and seek rectification — the right to verify the accuracy of their Data and ask for it to be updated or corrected.",
            "Restrict the processing of their Data under certain circumstances.",
            "Have their Personal Data deleted or otherwise removed under certain circumstances.",
            "Receive their Data in a structured, commonly used and machine-readable format.",
            "Lodge a complaint before their competent data protection authority.",
          ]} />

          <SubTitle>How to Exercise These Rights</SubTitle>
          <Prose>
            Any requests to exercise User rights can be directed to the Owner through the contact
            details provided in this document. These requests can be exercised free of charge and
            will be addressed by the Owner as early as possible, and always within one month.
          </Prose>

          <Divider />

          {/* Selling goods */}
          <SectionTitle>Selling Goods and Services Online</SectionTitle>
          <Prose>
            The Personal Data collected is used to provide Users with services and process orders,
            including payment and delivery. The Personal Data collected to complete the payment may
            include credit card information or other payment details. The kind of Data collected
            depends on the payment system used. {SITE} does not store payment card information.
          </Prose>

          <Divider />

          {/* Additional info */}
          <SectionTitle>Additional Information About Data Collection</SectionTitle>

          <SubTitle>Legal Action</SubTitle>
          <Prose>
            The User's Personal Data may be used for legal purposes by the Owner in court or in
            stages leading to possible legal action arising from improper use of {SITE} or the
            related Services. The User declares to be aware that the Owner may be required to
            reveal personal data upon request of public authorities.
          </Prose>

          <SubTitle>System Logs and Maintenance</SubTitle>
          <Prose>
            For operation and maintenance purposes, {SITE} and any third-party services may collect
            files that record interaction with {SITE} (system logs) and use other Personal Data
            (such as IP addresses) for this purpose.
          </Prose>

          <SubTitle>Do Not Track Requests</SubTitle>
          <Prose>
            {SITE} does not support "Do Not Track" requests. To determine whether any of the
            third-party services it uses honor "Do Not Track" requests, please read their privacy
            policies.
          </Prose>

          <SubTitle>Changes to This Privacy Policy</SubTitle>
          <Prose>
            The Owner reserves the right to make changes to this privacy policy at any time by
            notifying Users on this page. It is strongly recommended to check this page regularly,
            referring to the date of the last modification listed at the bottom. Should changes
            affect processing activities based on the User's consent, the Owner shall collect new
            consent from the User where required.
          </Prose>

          <Divider />

          {/* California CCPA */}
          <SectionTitle>Information for California Consumers (CCPA)</SectionTitle>
          <Prose>
            This section applies to all Users who are consumers residing in the State of California,
            United States of America, according to the California Consumer Privacy Act of 2018
            (CCPA). These provisions supersede any other possibly divergent provisions contained in
            the privacy policy.
          </Prose>

          <SubTitle>Categories of Personal Information Collected</SubTitle>
          <Prose>
            We have collected the following categories of personal information: identifiers and
            internet information. We will not collect additional categories of personal information
            without notifying you.
          </Prose>

          <SubTitle>Your California Privacy Rights</SubTitle>
          <BulletList items={[
            "The right to know — the categories and sources of personal information collected, the purposes for which we use it, and with whom it is shared.",
            "The right to delete — the right to request deletion of your personal information, subject to certain legal exceptions.",
            "The right to opt out — the right to opt out of the sale of your personal information.",
            "The right to non-discrimination — we will not discriminate against you for exercising any of your CCPA rights.",
          ]} />

          <SubTitle>Opt-Out of the Sale of Personal Information</SubTitle>
          <Prose>
            You have the right to opt out of the sale of your personal information. To do so,
            contact us using the details at the top of this document. {SITE} does not share any
            text messaging originator opt-in data and consent with any third parties.
          </Prose>

          <SubTitle>How to Submit a Verifiable Request</SubTitle>
          <Prose>
            To exercise your California privacy rights, submit a verifiable request to us using
            the contact details provided in this document. We will confirm receipt within 10 days
            and respond within 45 days. We may take up to 90 days if we notify you of the reason
            and extension. You may submit a maximum of 2 requests over a period of 12 months.
          </Prose>

          <Divider />

          {/* Definitions */}
          <SectionTitle>Definitions and Legal References</SectionTitle>

          <SubTitle>Personal Data (or Data)</SubTitle>
          <Prose>
            Any information that directly, indirectly, or in connection with other information
            allows for the identification or identifiability of a natural person.
          </Prose>

          <SubTitle>Usage Data</SubTitle>
          <Prose>
            Information collected automatically through {SITE}, which may include IP addresses,
            browser type, pages visited, time spent on pages, and other device and environment
            information.
          </Prose>

          <SubTitle>Cookies</SubTitle>
          <Prose>
            Small sets of data stored in the User's browser that help {SITE} remember preferences,
            sessions, and cart contents.
          </Prose>

          <SubTitle>Data Controller (or Owner)</SubTitle>
          <Prose>
            The natural or legal person that determines the purposes and means of the processing
            of Personal Data. For {SITE}, the Data Controller is {COMPANY}, {ADDRESS}.
          </Prose>

          <SubTitle>Service</SubTitle>
          <Prose>
            The custom embroidery ordering service provided by {SITE} as described on this website.
          </Prose>

          <SubTitle>User (or You)</SubTitle>
          <Prose>Any natural person or legal entity using {SITE}.</Prose>

          <Divider />

          <p className="text-xs text-gray-400">
            Last updated: {UPDATED} &mdash; {COMPANY}, {ADDRESS}
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
