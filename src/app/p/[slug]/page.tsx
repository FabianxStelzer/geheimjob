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
    <main className="mx-auto max-w-2xl flex-1 px-4 py-16">
      <p className="text-xs uppercase tracking-wide text-emerald-700">Anonymes Profil</p>
      <h1 className="mt-3 text-3xl font-semibold">{profile.professionField}</h1>
      <p className="mt-4 text-sm text-zinc-600">
        {profile.region} · {profile.experienceYears} Jahre Erfahrung · Verfügbarkeit:{" "}
        {profile.availability}
      </p>
      {profile.salaryPublic && profile.salaryExpectation != null ? (
        <p className="mt-2 text-sm text-zinc-600">
          Gehaltsvorstellung: {profile.salaryExpectation.toLocaleString("de-DE")} € brutto / Monat
        </p>
      ) : null}
      {profile.bio ? (
        <article className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-sm leading-relaxed shadow-sm">
          {profile.bio}
        </article>
      ) : null}
      <p className="mt-10 text-xs text-zinc-500">
        Identität und Kontakt werden über die Plattform erst nach Match-Freigabe geteilt. Videos sind in
        der anonymen Ansicht ausgeblendet.
      </p>
    </main>
  );
}
