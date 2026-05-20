import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/dashboard";

export default async function NotificationsPage() {
  const session = await auth();
  const items = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--gj-muted)]">
          {items.length} Einträge · {items.filter((n) => !n.read).length} ungelesen
        </p>
        <form action={markAllNotificationsRead}>
          <button type="submit" className="gj-btn-ghost">
            Alle als gelesen
          </button>
        </form>
      </div>

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="gj-card p-8 text-center text-sm text-[var(--gj-muted)]">Keine Einträge.</li>
        ) : (
          items.map((n) => (
            <li key={n.id} className={`gj-card p-4 ${n.read ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.read ? <span className="h-2 w-2 rounded-full bg-[var(--gj-primary)]" /> : null}
                    <p className="text-sm font-semibold text-[var(--gj-text)]">{n.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-[var(--gj-muted)]">{n.body}</p>
                  <p className="mt-2 text-xs text-[var(--gj-muted)]">
                    {n.createdAt.toLocaleString("de-DE")} · {n.kind}
                  </p>
                  {n.href ? (
                    <Link href={n.href} className="mt-2 inline-block text-sm text-[var(--gj-primary)] hover:underline">
                      Öffnen →
                    </Link>
                  ) : null}
                </div>
                {!n.read ? (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className="gj-btn-ghost">
                      Gelesen
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
