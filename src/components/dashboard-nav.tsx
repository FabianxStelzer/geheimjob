"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

type NavItem = { href: string; label: string };

const workerNav: NavItem[] = [
  { href: "/dashboard/worker", label: "Übersicht" },
  { href: "/dashboard/worker/profil", label: "Profil & Sharing" },
  { href: "/dashboard/worker/ausschluesse", label: "Ausschlüsse" },
  { href: "/dashboard/worker/unternehmen", label: "Unternehmen" },
  { href: "/dashboard/worker/anfragen", label: "Anfragen" },
];

const employerNav: NavItem[] = [
  { href: "/dashboard/employer", label: "Übersicht" },
  { href: "/dashboard/employer/profil", label: "Unternehmensprofil" },
  { href: "/dashboard/employer/suche", label: "Kandidaten-Suche" },
  { href: "/dashboard/employer/anfragen", label: "Anfragen" },
  { href: "/dashboard/employer/abrechnung", label: "Abrechnung" },
];

function normalizePath(p: string) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

function isNavActive(pathname: string, href: string) {
  const p = normalizePath(pathname);
  const h = normalizePath(href);
  if (h === "/dashboard/worker" || h === "/dashboard/employer") {
    return p === h;
  }
  if (h === "/dashboard/worker/anfragen" && p.startsWith("/dashboard/worker/chat")) {
    return true;
  }
  if (h === "/dashboard/employer/anfragen" && p.startsWith("/dashboard/employer/chat")) {
    return true;
  }
  return p === h || p.startsWith(`${h}/`);
}

function NavLink({ href, label }: NavItem) {
  const pathname = usePathname();
  const active = isNavActive(pathname, href);

  return (
    <Link
      href={href}
      className={`flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}

export function DashboardNav({
  role,
  email,
  unread,
}: {
  role: string | undefined;
  email: string | null | undefined;
  unread: number;
}) {
  const items: NavItem[] =
    role === "WORKER"
      ? workerNav
      : role === "EMPLOYER"
        ? employerNav
        : role === "ADMIN"
          ? [{ href: "/dashboard/admin", label: "Administration" }]
          : [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 px-1 pb-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-sm font-bold text-white shadow-lg shadow-teal-900/30">
          G
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Geheimjob</p>
          <p className="truncate text-xs text-slate-500">Plattform</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <NavLink href="/dashboard/benachrichtigungen" label={`Benachrichtigungen${unread > 0 ? ` (${unread})` : ""}`} />
      </nav>

      <div className="mt-8 border-t border-slate-700/80 pt-6">
        <p className="truncate px-1 text-xs font-medium text-slate-400">Angemeldet als</p>
        <p className="mt-1 truncate px-1 text-sm text-slate-200">{email ?? "—"}</p>
        <p className="mt-0.5 px-1 text-[10px] uppercase tracking-wider text-slate-500">{role ?? "—"}</p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
