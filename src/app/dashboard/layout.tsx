import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BrandLogo } from "@/components/brand-logo";
import { DashboardNav } from "@/components/dashboard-nav";
import { TopbarClient } from "@/components/topbar-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user.role;

  let unread = 0;
  if (session?.user.id) {
    unread = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });
  }

  return (
    <div className="flex min-h-screen bg-[var(--gj-bg)]">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--gj-border)] bg-white md:flex md:flex-col">
        <Link href="/dashboard" className="flex h-16 items-center border-b border-[var(--gj-border)] px-6">
          <BrandLogo className="text-[1.125rem] min-w-[120px]" />
        </Link>
        <div className="flex flex-1 flex-col justify-between px-4 py-6">
          <DashboardNav role={role} />
          <div className="pt-6">
            <Link
              href="/datenschutz"
              className="block px-3 py-2 text-xs text-[var(--gj-muted)] hover:text-[var(--gj-primary)]"
            >
              Support-Center
            </Link>
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <TopbarClient email={session?.user.email} role={role} unread={unread} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </section>
    </div>
  );
}
