"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  saveOnboardingApplication,
  saveOnboardingCareer,
  saveOnboardingContact,
  saveOnboardingSalary,
} from "@/app/actions/worker-onboarding";
import { ProfilePhotosUpload } from "@/components/profile-photos-upload";
import { ProfileVisibilitySettings } from "@/components/profile-visibility-settings";
import { parseApplicationProfile } from "@/lib/application-profile";
import { EMPLOYMENT_KIND_OPTIONS } from "@/lib/employment-kinds";
import { joinLinesInput } from "@/lib/cv-draft";
import { parseWorkerProfilePhotos } from "@/lib/worker-profile-photos";
import { parseProfileVisibility } from "@/lib/worker-profile-visibility";
import { WORKER_AVAILABILITY_OPTIONS } from "@/lib/worker-availability";
import type { WorkerProfile } from "@prisma/client";

const STEPS = [
  { id: "welcome", title: "Willkommen" },
  { id: "career", title: "Beruf & Verfügbarkeit" },
  { id: "salary", title: "Gehalt" },
  { id: "contact", title: "Kontakt" },
  { id: "photos", title: "Profilfotos" },
  { id: "visibility", title: "Sichtbarkeit" },
  { id: "application", title: "Bewerbung" },
  { id: "done", title: "Fertig" },
] as const;

type Props = {
  profile: Pick<
    WorkerProfile,
    | "displayName"
    | "professionField"
    | "region"
    | "availability"
    | "employmentKind"
    | "bio"
    | "salaryExpectation"
    | "salaryPublic"
    | "salaryKind"
    | "contactPhone"
    | "contactEmail"
    | "whatsappPhone"
    | "profilePhotosJson"
    | "photoUrl"
    | "profileVisibilityJson"
    | "profileVisible"
    | "cvShareMode"
    | "applicationProfileJson"
  >;
};

export function WorkerProfileOnboarding({ profile }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appProfile = parseApplicationProfile(profile.applicationProfileJson);
  const firstExp = appProfile.experiences[0];
  const profilePhotos = parseWorkerProfilePhotos(profile.profilePhotosJson, profile.photoUrl);
  const visibility = parseProfileVisibility(profile.profileVisibilityJson, profile);

  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  function goNext() {
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function submitStep(
    action: (fd: FormData) => Promise<{ ok: boolean }>,
    form: HTMLFormElement,
  ) {
    setBusy(true);
    setError(null);
    const res = await action(new FormData(form));
    setBusy(false);
    if (!res.ok) {
      setError("Speichern fehlgeschlagen. Bitte Eingaben prüfen.");
      return;
    }
    router.refresh();
    goNext();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="gj-card overflow-hidden p-0">
        <div className="border-b border-[var(--gj-border)] bg-[var(--gj-primary-softer)]/30 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gj-primary)]">
            Profil einrichten
          </p>
          <h1 className="mt-1 text-xl font-bold text-[var(--gj-text)]">
            {STEPS[step].title}
          </h1>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">
            Schritt {step + 1} von {STEPS.length} — Sie können jeden Schritt überspringen.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-[var(--gj-primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {step === 0 ? (
            <div className="space-y-4">
              <p className="text-[var(--gj-text-secondary)]">
                Hallo <strong>{profile.displayName}</strong> — Ihr Konto ist angelegt. In den
                nächsten Schritten vervollständigen wir Ihr Profil, damit Arbeitgeber Sie finden
                können.
              </p>
              <ul className="space-y-2 text-sm text-[var(--gj-text-secondary)]">
                <li className="flex gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>
                    <strong>{profile.professionField}</strong> · {profile.region}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">○</span>
                  <span>Verfügbarkeit, Gehalt und Kurzprofil</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">○</span>
                  <span>Fotos, Sichtbarkeit und Bewerbungsdaten</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={goNext} className="gj-btn-primary">
                  Los geht&apos;s
                </button>
                <Link href="/dashboard/worker" className="gj-btn-ghost">
                  Überspringen
                </Link>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submitStep(saveOnboardingCareer, e.currentTarget);
              }}
            >
              <label className="block">
                <span className="gj-label">Verfügbarkeit</span>
                <select
                  name="availability"
                  required
                  className="gj-input"
                  defaultValue={profile.availability}
                >
                  {WORKER_AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="gj-label">Beschäftigungsart</span>
                <select
                  name="employmentKind"
                  className="gj-input"
                  defaultValue={profile.employmentKind ?? ""}
                >
                  <option value="">Nicht angegeben</option>
                  {EMPLOYMENT_KIND_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="gj-label">Kurzprofil</span>
                <textarea
                  name="bio"
                  rows={5}
                  className="gj-textarea"
                  defaultValue={profile.bio ?? ""}
                  placeholder="Kurz beschreiben, was Sie beruflich ausmacht…"
                />
              </label>
              <StepNav busy={busy} onBack={goBack} onSkip={goNext} />
            </form>
          ) : null}

          {step === 2 ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submitStep(saveOnboardingSalary, e.currentTarget);
              }}
            >
              <label className="block">
                <span className="gj-label">Gehaltswunsch (€/Monat, optional)</span>
                <input
                  name="salaryExpectation"
                  type="number"
                  min={0}
                  className="gj-input"
                  defaultValue={profile.salaryExpectation ?? ""}
                  placeholder="5000"
                />
              </label>
              <label className="block">
                <span className="gj-label">Angabe als</span>
                <select
                  name="salaryKind"
                  className="gj-input"
                  defaultValue={profile.salaryKind}
                >
                  <option value="BRUTTO">Brutto</option>
                  <option value="NETTO">Netto</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="salaryPublic"
                  defaultChecked={profile.salaryPublic}
                />
                Gehaltswunsch öffentlich zeigen
              </label>
              <StepNav busy={busy} onBack={goBack} onSkip={goNext} />
            </form>
          ) : null}

          {step === 3 ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submitStep(saveOnboardingContact, e.currentTarget);
              }}
            >
              <p className="text-sm text-[var(--gj-muted)]">
                Optional — hilft Arbeitgebern, Sie nach einem Match schneller zu erreichen.
              </p>
              <label className="block">
                <span className="gj-label">Telefon</span>
                <input
                  name="contactPhone"
                  className="gj-input"
                  defaultValue={profile.contactPhone ?? ""}
                />
              </label>
              <label className="block">
                <span className="gj-label">Kontakt-E-Mail</span>
                <input
                  name="contactEmail"
                  type="email"
                  className="gj-input"
                  defaultValue={profile.contactEmail ?? ""}
                  placeholder="Falls abweichend vom Login"
                />
              </label>
              <label className="block">
                <span className="gj-label">WhatsApp</span>
                <input
                  name="whatsappPhone"
                  type="tel"
                  className="gj-input"
                  defaultValue={profile.whatsappPhone ?? ""}
                  placeholder="+49 170 1234567"
                />
              </label>
              <StepNav busy={busy} onBack={goBack} onSkip={goNext} />
            </form>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--gj-muted)]">
                Mehrere Fotos möglich — Arbeitgeber sehen sie oben in Ihrem Profil.
              </p>
              <ProfilePhotosUpload initialPhotos={profilePhotos} />
              <StepNav busy={busy} onBack={goBack} onSkip={goNext} showSave={false} />
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--gj-muted)]">
                Legen Sie fest, was Arbeitgeber sofort sehen und was erst nach Match freigegeben wird.
              </p>
              <ProfileVisibilitySettings initial={visibility} />
              <StepNav busy={busy} onBack={goBack} onSkip={goNext} showSave={false} />
            </div>
          ) : null}

          {step === 6 ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submitStep(saveOnboardingApplication, e.currentTarget);
              }}
            >
              <p className="text-sm text-[var(--gj-muted)]">
                Die wichtigsten Bewerbungsinhalte — Details können Sie später im Profil ergänzen.
              </p>
              <label className="block">
                <span className="gj-label">Überschrift / Position</span>
                <input
                  name="headline"
                  className="gj-input"
                  defaultValue={appProfile.headline}
                  placeholder="z. B. Senior Projektmanager"
                />
              </label>
              <label className="block">
                <span className="gj-label">Fähigkeiten (eine pro Zeile)</span>
                <textarea
                  name="skills"
                  rows={4}
                  className="gj-textarea"
                  defaultValue={joinLinesInput(appProfile.skills)}
                  placeholder={"Projektmanagement\nAgile Methoden"}
                />
              </label>
              <fieldset className="space-y-3 rounded-xl border border-[var(--gj-border)] p-4">
                <legend className="px-1 text-sm font-semibold text-[var(--gj-text)]">
                  Letzte Station (optional)
                </legend>
                <label className="block">
                  <span className="gj-label">Unternehmen</span>
                  <input
                    name="expCompany"
                    className="gj-input"
                    defaultValue={firstExp?.company ?? ""}
                  />
                </label>
                <label className="block">
                  <span className="gj-label">Rolle</span>
                  <input name="expRole" className="gj-input" defaultValue={firstExp?.role ?? ""} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="gj-label">Von</span>
                    <input name="expFrom" className="gj-input" defaultValue={firstExp?.from ?? ""} />
                  </label>
                  <label className="block">
                    <span className="gj-label">Bis</span>
                    <input name="expTo" className="gj-input" defaultValue={firstExp?.to ?? ""} />
                  </label>
                </div>
                <label className="block">
                  <span className="gj-label">Beschreibung</span>
                  <textarea
                    name="expDescription"
                    rows={3}
                    className="gj-textarea"
                    defaultValue={firstExp?.description ?? ""}
                  />
                </label>
              </fieldset>
              <StepNav busy={busy} onBack={goBack} onSkip={goNext} />
            </form>
          ) : null}

          {step === 7 ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
                ✓
              </div>
              <h2 className="text-lg font-semibold text-[var(--gj-text)]">Profil eingerichtet</h2>
              <p className="text-sm text-[var(--gj-muted)]">
                Sie können Ihr Profil jederzeit unter „Profil“ anpassen oder die Einrichtung erneut
                durchlaufen.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link href="/dashboard/worker" className="gj-btn-primary">
                  Zum Dashboard
                </Link>
                <Link href="/dashboard/worker/profil" className="gj-btn-secondary">
                  Profil bearbeiten
                </Link>
              </div>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

function StepNav({
  busy,
  onBack,
  onSkip,
  showSave = true,
}: {
  busy: boolean;
  onBack: () => void;
  onSkip: () => void;
  showSave?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[var(--gj-border)] pt-4">
      <button type="button" disabled={busy} onClick={onBack} className="gj-btn-ghost">
        Zurück
      </button>
      <button type="button" disabled={busy} onClick={onSkip} className="gj-btn-ghost">
        Überspringen
      </button>
      {showSave ? (
        <button type="submit" disabled={busy} className="gj-btn-primary ml-auto">
          {busy ? "Speichern…" : "Speichern & weiter"}
        </button>
      ) : (
        <button type="button" disabled={busy} onClick={onSkip} className="gj-btn-primary ml-auto">
          Weiter
        </button>
      )}
    </div>
  );
}
