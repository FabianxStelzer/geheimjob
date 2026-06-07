import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { regenerateAnonymousSlug, updateWorkerProfile } from "@/app/actions/dashboard";
import { ApplicationProfileEditor } from "@/components/application-profile-editor";
import { CvBuilder } from "@/components/cv-builder";
import { CvShareModeSettings } from "@/components/cv-share-mode-settings";
import { CvUploadField } from "@/components/cv-upload-field";
import { VideoUploadField } from "@/components/video-upload-field";
import { ProfilePhotosUpload } from "@/components/profile-photos-upload";
import { parseWorkerProfilePhotos } from "@/lib/worker-profile-photos";
import { CopyButton } from "@/components/copy-button";
import { EMPLOYMENT_KIND_OPTIONS } from "@/lib/employment-kinds";
import { WORKER_AVAILABILITY_OPTIONS } from "@/lib/worker-availability";

export default async function WorkerProfilPage() {
  const session = await auth();
  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!profile) {
    return <p className="text-sm text-red-600">Kein Profil gefunden.</p>;
  }

  const shareUrl = `${process.env.NEXTAUTH_URL ?? ""}/p/${profile.anonymousSlug}`;
  const profilePhotos = parseWorkerProfilePhotos(profile.profilePhotosJson, profile.photoUrl);

  return (
    <div className="space-y-6">
      <section className="gj-card p-6">
        <header className="mb-4">
          <h2 className="text-base font-semibold">Profil-Link</h2>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">
            Optional teilen — Arbeitgeber in der Kandidatensuche sehen Ihren Namen, Fotos und
            Bewerbungsdaten direkt.
          </p>
        </header>
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex-1 min-w-0 truncate rounded-lg border border-[var(--gj-border)] bg-[var(--gj-bg)] px-3 py-2 text-sm">
            {shareUrl}
          </code>
          <CopyButton text={shareUrl} />
          <form action={regenerateAnonymousSlug}>
            <button type="submit" className="gj-btn-ghost">
              Neuen Link erzeugen
            </button>
          </form>
        </div>
      </section>

      <section className="gj-card p-6">
        <h2 className="mb-1 text-base font-semibold">Profilfotos</h2>
        <p className="mb-4 text-sm text-[var(--gj-muted)]">
          Mehrere Bilder möglich — werden Arbeitgebern oben in Ihrem Profil angezeigt.
        </p>
        <ProfilePhotosUpload initialPhotos={profilePhotos} />
      </section>

      <section className="gj-card p-6">
        <h2 className="mb-4 text-base font-semibold">Stammdaten</h2>
        <form action={updateWorkerProfile} className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="gj-label">Name (für Arbeitgeber sichtbar)</span>
            <input name="displayName" defaultValue={profile.displayName} required className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Berufsfeld</span>
            <input name="professionField" defaultValue={profile.professionField} required className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Region</span>
            <input name="region" defaultValue={profile.region} required className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Telefon (optional, in Bewerbung sichtbar)</span>
            <input name="contactPhone" defaultValue={profile.contactPhone ?? ""} className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Kontakt-E-Mail (optional)</span>
            <input
              name="contactEmail"
              type="email"
              defaultValue={profile.contactEmail ?? ""}
              className="gj-input"
              placeholder="Falls abweichend vom Login"
            />
          </label>
          <label>
            <span className="gj-label">Jahre Erfahrung</span>
            <input name="experienceYears" type="number" defaultValue={profile.experienceYears} className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Verfügbarkeit</span>
            <select name="availability" required className="gj-input" defaultValue={profile.availability}>
              {WORKER_AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="gj-label">Beschäftigungsart</span>
            <select name="employmentKind" className="gj-input" defaultValue={profile.employmentKind ?? ""}>
              <option value="">Nicht angegeben</option>
              {EMPLOYMENT_KIND_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="gj-label">Gehaltswunsch (€/Monat)</span>
            <input
              name="salaryExpectation"
              type="number"
              defaultValue={profile.salaryExpectation ?? ""}
              className="gj-input"
              placeholder="5000"
            />
          </label>
          <label>
            <span className="gj-label">Angabe als</span>
            <select name="salaryKind" className="gj-input" defaultValue={profile.salaryKind}>
              <option value="BRUTTO">Brutto</option>
              <option value="NETTO">Netto</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <Link
              href="/dashboard/worker/gehalt"
              className="text-sm text-[var(--gj-primary)] hover:underline"
            >
              Netto-Schätzung für die Job-Suche einrichten →
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="salaryPublic" defaultChecked={profile.salaryPublic} />
              Gehalt öffentlich
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="profileVisible" defaultChecked={profile.profileVisible} />
            Profil in Arbeitgeber-Suche sichtbar
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Über mich (Kurztext)</span>
            <textarea name="bio" rows={4} defaultValue={profile.bio ?? ""} className="gj-textarea" />
          </label>
          <label>
            <span className="gj-label">LinkedIn</span>
            <input name="socialLinkedin" defaultValue={profile.socialLinkedin ?? ""} className="gj-input" />
          </label>
          <label>
            <span className="gj-label">XING</span>
            <input name="socialXing" defaultValue={profile.socialXing ?? ""} className="gj-input" />
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Website</span>
            <input name="socialWebsite" defaultValue={profile.socialWebsite ?? ""} className="gj-input" />
          </label>
          <div className="md:col-span-2 pt-2">
            <button type="submit" className="gj-btn-primary">
              Stammdaten speichern
            </button>
          </div>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="mb-1 text-base font-semibold">Bewerbungsprofil</h2>
        <p className="mb-4 text-sm text-[var(--gj-muted)]">
          Klassische Bewerbungsinhalte für Arbeitgeber: Werdegang, Fähigkeiten, Ausbildung und mehr.
          Der Lebenslauf als PDF/Builder bleibt separat und ist nur sichtbar, wenn Sie ihn freigeben.
        </p>
        <ApplicationProfileEditor
          initialJson={profile.applicationProfileJson}
          previewContext={{
            bio: profile.bio,
            contactPhone: profile.contactPhone,
            contactEmail: profile.contactEmail,
            socialLinkedin: profile.socialLinkedin,
            socialXing: profile.socialXing,
            socialWebsite: profile.socialWebsite,
          }}
        />
      </section>

      <section className="gj-card p-6">
        <h2 className="mb-1 text-base font-semibold">Lebenslauf (geschützt)</h2>
        <p className="mb-4 text-sm text-[var(--gj-muted)]">
          Vollständiger Lebenslauf — nur sichtbar bei „Sofort teilen“ oder nach Ihrer Freigabe auf
          Anfrage.
        </p>
        <div className="mb-6">
          <CvShareModeSettings currentMode={profile.cvShareMode} />
        </div>
        <CvBuilder
          initialJson={profile.cvDraftJson}
          profileMeta={{
            displayName: profile.displayName,
            professionField: profile.professionField,
            region: profile.region,
          }}
        />
      </section>

      <section className="gj-card p-6">
        <h2 className="mb-1 text-base font-semibold">Dateien</h2>
        <p className="mb-4 text-sm text-[var(--gj-muted)]">
          Optional PDF oder Kurzvideo — unterliegen denselben Freigabe-Regeln wie der Lebenslauf.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <CvUploadField />
          <VideoUploadField />
        </div>
        {profile.videoIntroUrl ? (
          <video
            key={profile.videoIntroUrl}
            className="mt-6 w-full max-w-md rounded-xl border border-[var(--gj-border)]"
            controls
            src={profile.videoIntroUrl}
          />
        ) : null}
        <p className="mt-4 text-xs text-[var(--gj-muted)]">
          Eigene PDF-Vorschau:{" "}
          <Link href="/api/cv/self" className="text-[var(--gj-primary)] hover:underline">
            anzeigen
          </Link>
        </p>
      </section>
    </div>
  );
}
