import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function EmployerHome() {
  const session = await auth();
  const profile = await prisma.employerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Arbeitgeber-Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">
          {profile?.companyName} · Filterbare Kandidaten-Suche und kontrollierte Matches.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/employer/suche"
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-400"
        >
          <h3 className="font-semibold">Kandidaten-Suche</h3>
          <p className="mt-2 text-sm text-zinc-600">Filtern nach Feld, Region, Verfügbarkeit, Gehalt.</p>
        </Link>
        <Link
          href="/dashboard/employer/anfragen"
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-400"
        >
          <h3 className="font-semibold">Anfragen</h3>
          <p className="mt-2 text-sm text-zinc-600">Matches bestätigen oder ablehnen.</p>
        </Link>
        <Link
          href="/dashboard/employer/abrechnung"
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-400"
        >
          <h3 className="font-semibold">Abrechnung & Vertrauen</h3>
          <p className="mt-2 text-sm text-zinc-600">Stripe & Bewertungen.</p>
        </Link>
      </section>
    </div>
  );
}
