import { notFound } from "next/navigation";
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
    <main className="mx-auto max-w-2xl flex-1 px-4 py-12 sm:py-16">
      <div className="gj-card p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Öffentliches Profil</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{profile.professionField}</h1>
        <p className="mt-4 text-sm text-slate-600">
          {profile.region} · {profile.experienceYears} Jahre Erfahrung · Verfügbarkeit: {profile.availability}
        </p>
        {profile.salaryPublic && profile.salaryExpectation != null ? (
          <p className="mt-2 text-sm text-slate-600">
            Gehaltsvorstellung: {profile.salaryExpectation.toLocaleString("de-DE")} € brutto / Monat
          </p>
        ) : null}
        {profile.bio ? (
          <article className="mt-8 rounded-xl border border-slate-100 bg-slate-50/80 p-6 text-sm leading-relaxed text-slate-800">
            {profile.bio}
          </article>
        ) : null}
        <p className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-500">
          Identität und Kontakt werden erst nach Match-Freigabe über die Plattform geteilt. Videos sind in dieser
          Ansicht ausgeblendet.
        </p>
      </div>
      <p className="mt-6 text-center">
        <a href="/login" className="text-sm font-medium text-teal-700 hover:text-teal-900">
          Zur Plattform-Anmeldung
        </a>
      </p>
    </main>
  );
}
