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
        <div>
          <h1 className="text-3xl font-semibold">Benachrichtigungen</h1>
          <p className="mt-2 text-sm text-zinc-600">Match-Anfragen, Chat und Zahlungen.</p>
        </div>
        <form action={markAllNotificationsRead}>
          <button type="submit" className="rounded-lg border border-zinc-300 px-3 py-2 text-xs hover:bg-zinc-50">
            Alle als gelesen
          </button>
        </form>
      </div>

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-zinc-500">Keine Einträge.</li>
        ) : (
          items.map((n) => (
            <li
              key={n.id}
              className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ${n.read ? "opacity-70" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-sm text-zinc-600">{n.body}</p>
                  <p className="mt-2 text-xs text-zinc-400">
                    {n.createdAt.toLocaleString("de-DE")} · {n.kind}
                  </p>
                  {n.href ? (
                    <Link href={n.href} className="mt-2 inline-block text-sm underline">
                      Öffnen
                    </Link>
                  ) : null}
                </div>
                {!n.read ? (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className="text-xs text-zinc-600 underline">
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
