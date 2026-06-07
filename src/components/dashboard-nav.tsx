"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseIcon,
  BuildingIcon,
  ChatIcon,
  EuroIcon,
  GiftIcon,
  SendIcon,
  ShieldIcon,
  CreditCardIcon,
  UserIcon,
  UsersIcon,
  SettingsIcon,
} from "@/components/icons";

type NavItem = {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.JSX.Element;
};

const workerNav: NavItem[] = [
  { href: "/dashboard/worker", label: "Job-Suche", Icon: BriefcaseIcon },
  { href: "/dashboard/worker/unternehmen", label: "Unternehmen", Icon: BuildingIcon },
  { href: "/dashboard/worker/anfragen", label: "Bewerbungen", Icon: SendIcon },
  { href: "/dashboard/worker/nachrichten", label: "Nachrichten", Icon: ChatIcon },
  { href: "/dashboard/worker/gehalt", label: "Gehalt & Steuern", Icon: EuroIcon },
  { href: "/dashboard/worker/ausschluesse", label: "Ausschlüsse", Icon: ShieldIcon },
  { href: "/dashboard/worker/profil", label: "Profil", Icon: UserIcon },
  { href: "/dashboard/worker/referral", label: "Referral", Icon: GiftIcon },
];

const employerNav: NavItem[] = [
  { href: "/dashboard/employer", label: "Kandidaten", Icon: UsersIcon },
  { href: "/dashboard/employer/anfragen", label: "Anfragen", Icon: SendIcon },
  { href: "/dashboard/employer/nachrichten", label: "Nachrichten", Icon: ChatIcon },
  { href: "/dashboard/employer/stellen", label: "Stellen", Icon: BriefcaseIcon },
  { href: "/dashboard/employer/profil", label: "Unternehmen", Icon: SettingsIcon },
  { href: "/dashboard/employer/abrechnung", label: "Pakete", Icon: CreditCardIcon },
];

const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Super-Admin", Icon: ShieldIcon },
  { href: "/dashboard/admin/unternehmen", label: "Unternehmen", Icon: SettingsIcon },
  { href: "/dashboard/admin/arbeitnehmer", label: "Arbeitnehmer", Icon: UsersIcon },
  { href: "/dashboard/admin/whatsapp", label: "WhatsApp", Icon: ChatIcon },
  { href: "/dashboard/admin/pakete", label: "Pakete", Icon: CreditCardIcon },
  { href: "/dashboard/admin/abonnements", label: "Abonnements", Icon: BriefcaseIcon },
  { href: "/dashboard/admin/einstellungen", label: "Einstellungen", Icon: SettingsIcon },
];

function normalize(p: string) {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

function isActive(pathname: string, href: string) {
  const p = normalize(pathname);
  const h = normalize(href);

  if (h === "/dashboard/worker" || h === "/dashboard/employer") {
    return p === h || p.startsWith(`${h}?`);
  }

  if (h === "/dashboard/worker/unternehmen") {
    return p === h || p.startsWith(`${h}/`);
  }

  if (h === "/dashboard/worker/nachrichten" && p.startsWith("/dashboard/worker/chat")) return true;
  if (h === "/dashboard/employer/nachrichten" && p.startsWith("/dashboard/employer/chat")) return true;

  if (h === "/dashboard/employer/stellen") {
    return p === h;
  }

  if (h === "/dashboard/admin") {
    return p === h;
  }
  if (h.startsWith("/dashboard/admin/")) {
    return p === h || p.startsWith(`${h}/`);
  }

  return p === h || p.startsWith(`${h}/`);
}

function NavLink({ href, label, Icon, collapsed }: NavItem & { collapsed?: boolean }) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className="gj-nav-pill"
      data-active={isActive(pathname, href)}
      title={collapsed ? label : undefined}
    >
      <Icon />
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  );
}

export function DashboardNav({
  role,
  collapsed,
}: {
  role: string | undefined;
  collapsed?: boolean;
}) {
  const items =
    role === "WORKER" ? workerNav : role === "EMPLOYER" ? employerNav : role === "ADMIN" ? adminNav : [];

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink key={item.href} {...item} collapsed={collapsed} />
      ))}
    </nav>
  );
}
