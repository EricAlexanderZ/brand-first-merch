import Image from "next/image";
import Link from "next/link";
import { SiteHeader, TopBanner } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import BestSellerCard from "@/components/home/best-seller-card";
import { ProcessSteps } from "@/components/process-steps";
import ScrollToCategories from "@/components/home/scroll-to-categories";
import HeroLogo from "@/components/home/hero-logo";
import { bestSellers, categories, logos } from "@/lib/home-content";

export default function Home() {
  return (
    <main className="min-h-dvh bg-white text-black">
      <TopBanner />
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center md:hidden" style={{ backgroundImage: "url('/images/home/BG_COVER.JPG')" }} />
        <div className="absolute inset-0 hidden bg-cover bg-center md:block" style={{ backgroundImage: "url('/images/home/BG_COVER_DESKTOP.JPG')" }} />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative mx-auto min-h-[560px] max-w-7xl px-6 pt-0 pb-0 lg:py-20 flex items-center justify-between gap-4 lg:gap-10">
          <div className="w-full text-center lg:max-w-2xl lg:text-left">
            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl sm:leading-[0.95] lg:text-7xl xl:text-8xl">
              Order custom
              <br />
              embroidered hats
              <br />
              and apparel.
            </h1>

            <p className="mx-auto mt-8 max-w-lg rounded-2xl bg-black/40 px-4 py-3 text-lg font-medium text-white/90 lg:mx-0 lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0">
              Fast ordering, clean proofs, premium stitching, and a practical
              process built for brands, teams, and businesses.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link prefetch={false}
                href="/products/custom-hats"
                className="rounded-full bg-[#13294b] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:scale-105 hover:bg-[#0f1f39]"
              >
                Shop Hats
              </Link>

              <ScrollToCategories />
            </div>

            {/* Mobile stats */}
            <div className="mt-6 flex items-center justify-center gap-0 rounded-2xl bg-black/40 px-5 py-3 lg:hidden">
              <div className="text-center">
                <p className="text-xl font-extrabold text-white">680+</p>
                <p className="text-xs text-white/60">Happy customers</p>
              </div>
              <div className="mx-5 h-8 w-px bg-white/30" />
              <div className="text-center">
                <p className="text-xl font-extrabold text-white">5/5</p>
                <p className="text-xs text-white/60">Average review score</p>
              </div>
            </div>

            <div className="mt-10 hidden gap-10 text-white lg:flex">
              <div>
                <p className="text-3xl font-extrabold">500+</p>
                <p className="text-sm text-white/80">Orders completed</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold">5/5</p>
                <p className="text-sm text-white/80">Customer experience</p>
              </div>
            </div>
          </div>

          {/* Floating logo — desktop only */}
          <div className="hidden lg:block shrink-0">
            <HeroLogo />
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-14">
        <h2 className="text-center text-4xl font-extrabold tracking-tight">
          Shop by Category
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
          {categories.map((category) => (
            <Link prefetch={false}
              key={category.name}
              href={category.href}
              className="group flex flex-col items-center justify-center rounded-2xl p-3 text-center transition duration-300 sm:p-4"
            >
              <div className="transition duration-300 group-hover:scale-110">
                {category.image ? (
                  <div className="relative h-28 w-28 sm:h-48 sm:w-48">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 112px, 192px"
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                ) : (
                  <span className="text-5xl">{category.icon}</span>
                )}
              </div>
              <span className="mt-3 text-base font-bold transition duration-300 group-hover:text-[#13294b] sm:mt-4 sm:text-2xl">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-4xl font-extrabold tracking-tight">
          Best Selling Products
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-4 md:gap-6">
  {bestSellers.map((item) => (
  <BestSellerCard
  key={item.title}
  title={item.title}
  image={item.image}
  href={item.href}
  imageScale={item.imageScale}
/>
))}
</div>
      </section>

      <ProcessSteps />

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl overflow-hidden px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.45em] text-[#5f6675]">
            Trusted by brands big and small
          </p>

          <div className="mt-10 overflow-hidden">
            <div className="brand-track flex min-w-max items-center gap-6 md:gap-12 lg:gap-16">
              {[...logos, ...logos].map((logo, index) => (
                <div key={`${logo.alt}-${index}`} className="relative h-8 w-24 shrink-0 md:h-12 md:w-32 lg:h-16 lg:w-48">
                  <Image src={logo.src} alt={logo.alt} fill sizes="(max-width: 640px) 112px, 192px" className="object-contain" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-[2rem] border border-[#ebcf8d] bg-white p-6 sm:p-10 text-center shadow-sm">
            <h3 className="text-2xl sm:text-4xl font-extrabold">Have any questions for us?</h3>
            <Link prefetch={false}
              href="/contact"
              className="mt-6 inline-flex rounded-full bg-[#13294b] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 hover:bg-[#0f1f39]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
