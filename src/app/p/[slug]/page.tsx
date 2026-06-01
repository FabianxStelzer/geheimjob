import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicAnonymousProfilePage(props: Props) {
  const { slug } = await props.params;

  const profile = await prisma.workerProfile.findUnique({
    where: { anonymousSlug: slug },
    include: { user: true },
  });

  if (!profile || profile.user.deletedAt || !profile.profileVisible) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--gj-bg)]">
      <header className="border-b border-[var(--gj-border)] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <BrandLogo className="text-base min-w-[120px]" />
          <Link href="/login" className="text-sm font-medium text-[var(--gj-primary)] hover:text-[var(--gj-primary-hover)]">
            Anmelden
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl flex-1 px-4 py-12 sm:py-16">
        <div className="gj-card p-8 sm:p-10">
          <span className="gj-chip gj-chip-solid text-[11px] uppercase">Anonym</span>
          <h1 className="mt-4 text-[28px] font-bold leading-tight text-[var(--gj-text)]">{profile.professionField}</h1>
          <p className="mt-4 text-sm text-[var(--gj-text-secondary)]">
            {profile.region} · {profile.experienceYears} Jahre Erfahrung · Verfügbarkeit: {profile.availability}
          </p>
          {profile.salaryPublic && profile.salaryExpectation != null ? (
            <p className="mt-2 text-sm text-[var(--gj-text-secondary)]">
              Gehaltsvorstellung: {profile.salaryExpectation.toLocaleString("de-DE")} € brutto / Monat
            </p>
          ) : null}
          {profile.bio ? (
            <article className="mt-8 rounded-xl border border-[var(--gj-border)] bg-[var(--gj-primary-soft)]/50 p-6 text-sm leading-relaxed text-[var(--gj-text-secondary)]">
              {profile.bio}
            </article>
          ) : null}
          <p className="mt-8 border-t border-[var(--gj-border)] pt-6 text-xs text-[var(--gj-muted)]">
            Identität und Kontakt werden erst nach Match-Freigabe über die Plattform geteilt. Videos sind in dieser
            Ansicht ausgeblendet.
          </p>
        </div>
      </main>
    </div>
  );
}
