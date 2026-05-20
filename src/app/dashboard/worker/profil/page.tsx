import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  regenerateAnonymousSlug,
  updateWorkerProfile,
} from "@/app/actions/dashboard";
import { CvUploadField } from "@/components/cv-upload-field";
import { VideoUploadField } from "@/components/video-upload-field";
import { DeleteAccountButton } from "@/components/delete-account-button";

export default async function WorkerProfilPage() {
  const session = await auth();
  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!profile) {
    return <p className="text-sm text-red-600">Kein Profil gefunden.</p>;
  }

  const shareUrl = `${process.env.NEXTAUTH_URL ?? ""}/p/${profile.anonymousSlug}`;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Profil & Sharing</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Anonymer Link ohne Namen für Außenstehende. Namen &amp; E-Mail werden erst nach Match
          freigegeben.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Anonymer Profil-Link</h2>
        <p className="mt-2 break-all text-sm text-emerald-900">{shareUrl}</p>
        <form action={regenerateAnonymousSlug} className="mt-4">
          <button type="submit" className="rounded-lg border border-zinc-300 px-3 py-2 text-xs">
            Neuen Slug erzeugen
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Profil bearbeiten</h2>
        <form action={updateWorkerProfile} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm md:col-span-2">
            <span className="text-zinc-600">Anzeigename (intern)</span>
            <input
              name="displayName"
              defaultValue={profile.displayName}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-zinc-600">Berufsfeld</span>
            <input
              name="professionField"
              defaultValue={profile.professionField}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-zinc-600">Region</span>
            <input
              name="region"
              defaultValue={profile.region}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-zinc-600">Jahre Erfahrung</span>
            <input
              name="experienceYears"
              type="number"
              defaultValue={profile.experienceYears}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-zinc-600">Verfügbarkeit</span>
            <input
              name="availability"
              defaultValue={profile.availability}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-zinc-600">Gehaltswunsch</span>
            <input
              name="salaryExpectation"
              type="number"
              defaultValue={profile.salaryExpectation ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="salaryPublic" defaultChecked={profile.salaryPublic} />
            Gehalt öffentlich
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="profileVisible" defaultChecked={profile.profileVisible} />
            Profil in Arbeitgeber-Suche sichtbar
          </label>
          <label className="text-sm md:col-span-2">
            <span className="text-zinc-600">Kurzprofil</span>
            <textarea
              name="bio"
              rows={4}
              defaultValue={profile.bio ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-zinc-600">LinkedIn</span>
            <input
              name="socialLinkedin"
              defaultValue={profile.socialLinkedin ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-zinc-600">XING</span>
            <input
              name="socialXing"
              defaultValue={profile.socialXing ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="text-zinc-600">Website</span>
            <input
              name="socialWebsite"
              defaultValue={profile.socialWebsite ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="text-zinc-600">
              Strukturierter Lebenslauf (JSON/Text — später durch Editor ersetzbar)
            </span>
            <textarea
              name="cvDraftJson"
              rows={6}
              defaultValue={profile.cvDraftJson ?? ""}
              placeholder='{"beruf":"…","skills":["…"]}'
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs"
            />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
              Speichern
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Dateien</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <CvUploadField />
          <VideoUploadField />
        </div>
        {profile.videoIntroUrl ? (
          <video
            key={profile.videoIntroUrl}
            className="mt-6 w-full max-w-md rounded-xl border border-zinc-200"
            controls
            src={profile.videoIntroUrl}
          />
        ) : null}
        <p className="mt-4 text-xs text-zinc-500">
          PDF-Lebenslauf für Arbeitgeber erst nach Match:{" "}
          <Link href="/api/cv/self" className="underline">
            eigene Vorschau
          </Link>
        </p>
      </section>

      <section className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">Konto löschen</h2>
        <p className="mt-2 text-sm text-red-800">
          Hiermit werden Zugangsdaten anonymisiert und Profile bereinigt (Demo-Implementierung —
          produktiv Rechtsfolgen prüfen).
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}
