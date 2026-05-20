import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function WorkerHome() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const base = process.env.NEXTAUTH_URL ?? "";
  const referralLink = `${base}/register/arbeitnehmer?ref=${user?.referralCode ?? ""}`;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Arbeitnehmer-Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Teilen Sie Ihr anonymes Profil oder laden Sie Kolleginnen mit Ihrem Referral-Link ein.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Referral-Programm</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Link weitergeben — bei erfolgreicher Registrierung entsteht ein Eintrag{" "}
          <code className="rounded bg-zinc-100 px-1">ReferralReward</code> (Bonus-Auszahlung
          konfigurierbar).
        </p>
        <p className="mt-4 break-all rounded-lg bg-zinc-50 p-3 text-sm">{referralLink}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dashboard/worker/profil"
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-400"
        >
          <h3 className="font-semibold">Profil & Lebenslauf</h3>
          <p className="mt-2 text-sm text-zinc-600">PDF, Kurzvideo, strukturierter Lebenslauf-Entwurf.</p>
        </Link>
        <Link
          href="/dashboard/worker/unternehmen"
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-400"
        >
          <h3 className="font-semibold">Unternehmen kontaktieren</h3>
          <p className="mt-2 text-sm text-zinc-600">Initiieren Sie Matches bei ausgewählten Arbeitgebern.</p>
        </Link>
      </section>
    </div>
  );
}
