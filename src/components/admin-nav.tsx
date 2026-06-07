"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/admin", label: "Übersicht" },
  { href: "/dashboard/admin/unternehmen", label: "Unternehmen" },
  { href: "/dashboard/admin/arbeitnehmer", label: "Arbeitnehmer" },
  { href: "/dashboard/admin/einstellungen", label: "Einstellungen" },
  { href: "/dashboard/admin/abonnements", label: "Abonnements" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-[var(--gj-border)] pb-4">
      {links.map((l) => {
        const active =
          l.href === "/dashboard/admin"
            ? pathname === l.href
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-[var(--gj-primary)] text-white"
                : "bg-white text-[var(--gj-muted)] hover:bg-[var(--gj-primary-soft)] hover:text-[var(--gj-primary)]"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
