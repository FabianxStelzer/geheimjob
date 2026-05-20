import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateEmployerProfile } from "@/app/actions/dashboard";

export default async function EmployerProfilPage() {
  const session = await auth();
  const profile = await prisma.employerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!profile) return <p className="text-sm text-red-600">Kein Profil.</p>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Unternehmensprofil</h1>
      </header>
      <form action={updateEmployerProfile} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <label className="block text-sm">
          Firmenname
          <input name="companyName" defaultValue={profile.companyName} required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Branche
          <input name="industry" defaultValue={profile.industry} required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Region
          <input name="region" defaultValue={profile.region} required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Ansprechpartner
          <input name="contactName" defaultValue={profile.contactName} required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Telefon
          <input name="contactPhone" defaultValue={profile.contactPhone ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Website
          <input name="website" defaultValue={profile.website ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="block text-sm md:col-span-2">
          Offene Stellen / Hinweis
          <textarea name="openPositionsNote" rows={4} defaultValue={profile.openPositionsNote ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
          Speichern
        </button>
      </form>
    </div>
  );
}
