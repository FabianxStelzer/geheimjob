import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";

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
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-10">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Konto</p>
          <p className="mt-1 truncate text-sm font-medium">{session?.user.email}</p>
          <p className="text-xs text-zinc-500">{role}</p>
          <div className="mt-4 space-y-2 text-sm">
            {role === "WORKER" ? (
              <>
                <Link href="/dashboard/worker" className="block hover:underline">
                  Übersicht
                </Link>
                <Link href="/dashboard/worker/profil" className="block hover:underline">
                  Profil & Sharing
                </Link>
                <Link href="/dashboard/worker/ausschluesse" className="block hover:underline">
                  Ausschlüsse
                </Link>
                <Link href="/dashboard/worker/unternehmen" className="block hover:underline">
                  Unternehmen entdecken
                </Link>
                <Link href="/dashboard/worker/anfragen" className="block hover:underline">
                  Anfragen
                </Link>
              </>
            ) : null}
            {role === "EMPLOYER" ? (
              <>
                <Link href="/dashboard/employer" className="block hover:underline">
                  Übersicht
                </Link>
                <Link href="/dashboard/employer/profil" className="block hover:underline">
                  Unternehmensprofil
                </Link>
                <Link href="/dashboard/employer/suche" className="block hover:underline">
                  Kandidaten-Suche
                </Link>
                <Link href="/dashboard/employer/anfragen" className="block hover:underline">
                  Anfragen
                </Link>
                <Link href="/dashboard/employer/abrechnung" className="block hover:underline">
                  Abrechnung
                </Link>
              </>
            ) : null}
            {role === "ADMIN" ? (
              <Link href="/dashboard/admin" className="block hover:underline">
                Admin-Dashboard
              </Link>
            ) : null}
            <Link href="/dashboard/benachrichtigungen" className="block hover:underline">
              Benachrichtigungen {unread > 0 ? `(${unread})` : ""}
            </Link>
          </div>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </div>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
