import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-8 md:gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link prefetch={false} href="/" className="inline-flex" aria-label="Brand First Merch home">
              <Wordmark className="h-14" sizes="68px" />
            </Link>
            <p className="mt-3 text-sm text-white/70">{site.email}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/60">Company</p>
            <div className="mt-4 space-y-3 text-sm">
              {/* About is temporarily hidden; see app/about/page.tsx. */}
              {/* <Link prefetch={false} href="/about" className="block hover:text-[#ffd84d]">
                About
              </Link> */}
              {/* Sitewide entry point to the local guides. The footer matters
                  here because it is on every page, which is how a crawler finds
                  the city posts from anywhere on the site. */}
              <Link prefetch={false} href="/blog" className="block hover:text-[#ffd84d]">
                Embroidery Guides
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/60">Support</p>
            <div className="mt-4 space-y-3 text-sm">
              <Link prefetch={false} href="/faq" className="block hover:text-[#ffd84d]">
                FAQ
              </Link>
              <Link prefetch={false} href="/contact" className="block hover:text-[#ffd84d]">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/60">Legal</p>
            <div className="mt-4 space-y-3 text-sm">
              <Link prefetch={false} href="/privacy" className="block hover:text-[#ffd84d]">
                Privacy
              </Link>
              <Link prefetch={false} href="/terms" className="block hover:text-[#ffd84d]">
                Terms
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:justify-between">
          <span>© 2026 Brand First Merch. All rights reserved.</span>

          {/*
            Agency credit. A plain <a>, not next/link, because this leaves the
            site entirely and there is nothing for the router to prefetch.

            TurboSites' brand blue #0151fc is too dark to read as small text on
            black, so it is used only for the bolt and the hover border, and the
            wordmark runs through a lighter ramp instead. Nothing animates at
            rest and there is no backdrop-filter, per the iOS crash notes.
          */}
          <a
            href="https://turbosites.io"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 transition hover:border-[#0151fc]/60 hover:bg-white/[0.06]"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 fill-[#5B9BD5] transition group-hover:fill-[#9EC5FF]"
            >
              <path d="M13 2 4.5 13.2h5.6L9.8 22l8.7-11.4h-5.7L13 2Z" />
            </svg>
            <span className="text-white/55">Site by</span>
            <span className="bg-gradient-to-r from-[#9EC5FF] via-[#5B9BD5] to-[#4A90C4] bg-clip-text font-extrabold tracking-tight text-transparent">
              TurboSites.io
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}