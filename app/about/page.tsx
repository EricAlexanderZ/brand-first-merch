import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/*
 * Hidden 2026-09-30, temporarily, at Eric's request.
 *
 * Unlinked from the footer and pulled from the sitemap, and noindexed here so
 * the copy stops appearing in search while it is out of use. The route is
 * deliberately left serving: removing it would 404 anyone arriving from an old
 * link or a search result that has not yet dropped out.
 *
 * To restore: delete this metadata block and uncomment the footer link and the
 * sitemap entry.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-white text-black">
      <TopBanner />
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/5 px-6 py-16 text-center">
        <div className="absolute inset-0 bg-cover bg-center md:hidden" style={{ backgroundImage: "url('/images/home/BG_COVER.JPG')" }} />
        <div className="absolute inset-0 hidden bg-cover bg-center md:block" style={{ backgroundImage: "url('/images/home/BG_COVER_DESKTOP.JPG')" }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/70">Our Story</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Built from the ground up.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/70">
            A family, a machine, and a whole lot of heart.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">

          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-[2rem] shadow-xl">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src="/images/home/HUMBLE_BEGININGS.jpg"
                  alt="Humble beginnings — embroidering in a 2-bedroom apartment"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-[1.5rem] border border-[#ebcf8d] bg-white px-5 py-3 shadow-md">
              <p className="text-xs font-bold uppercase tracking-widest text-[#13294b]">Where it all started</p>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              It started in a&nbsp;2&#8209;bedroom apartment.
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-gray-600">
              <p>
                What you see today didn't start in a warehouse or with a big investment,
                it started in a small apartment with one machine, a dream, and a deep
                passion for creating something people would be proud to wear.
              </p>
              <p>
                Every single order was stitched by hand in that little space. No shortcuts,
                no cutting corners, just a commitment to doing the work right every time.
                That standard never changed, even as the business grew.
              </p>
              <p>
                Over time, that dedication paid off in ways I never took for granted.
                El Hilo Co allowed me to upgrade to a bigger machine, move my family
                into our home, and put food on the table for my wife and two kids.
                Every order that comes through carries that meaning with it.
              </p>
              <p>
                I hold myself and this business to a very high standard because I know
                what it took to get here. Quality isn't just a selling point it's
                personal. Fast turnarounds aren't just a promise, they're a sign of
                respect for your time and your brand.
              </p>
              <p>
                You may know us as El Hilo Co. Same shop, same machines, same
                person answering your texts. The name is now Brand First Merch,
                because that is what the work has always been about: making sure
                your brand is the thing people notice.
              </p>
              <p className="font-semibold text-black">
                Thank you for trusting us. This is more than a business,
                it's everything.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link prefetch={false}
                href="/products/custom-hats"
                className="rounded-full bg-[#13294b] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 hover:bg-[#0f1f39]"
              >
                Shop Now
              </Link>
              <Link prefetch={false}
                href="/contact"
                className="rounded-full border border-[#13294b] px-6 py-3 text-sm font-semibold text-[#13294b] transition hover:bg-[#eef2f7]"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="bg-[#f6f6f4] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            What we stand for
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                title: "Quality first",
                text: "Every stitch is a reflection of this business. We don't ship anything we wouldn't be proud to wear ourselves.",
              },
              {
                title: "Fast turnarounds",
                text: "Your time matters. We move with urgency on every order because we know you're counting on us.",
              },
              {
                title: "High standards",
                text: "From the proof to the final product, we hold ourselves accountable at every step of the process.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-[1.5rem] border border-black/5 bg-white p-6 shadow-sm"
              >
                <p className="text-base font-extrabold text-[#13294b]">{value.title}</p>
                <p className="mt-2 text-sm leading-7 text-gray-500">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
