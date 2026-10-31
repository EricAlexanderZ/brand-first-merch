"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";

const NAV = [
  { href: "/admin",            label: "Dashboard", icon: "▣" },
  { href: "/admin/orders",     label: "Orders",    icon: "≡" },
  { href: "/admin/leads",      label: "Leads",     icon: "☏" },
  { href: "/admin/customers",  label: "Customers", icon: "◎" },
  { href: "/admin/analytics",  label: "Analytics", icon: "↗" },
  { href: "/admin/archive",    label: "Archive",   icon: "⊡" },
];

type Props = { open: boolean; onClose: () => void };

export default function AdminNav({ open, onClose }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function handleNavClick() {
    onClose();
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — drawer on mobile, always visible on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col bg-[#13294b] text-white transition-transform duration-300
          md:relative md:translate-x-0 md:transition-none
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <Wordmark className="h-9 shrink-0" sizes="44px" />
            <p className="text-sm font-extrabold text-white">Admin Panel</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link prefetch={false}
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <span>↩</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
