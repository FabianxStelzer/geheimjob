"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  saveOnboardingCareer,
  saveOnboardingContact,
  saveOnboardingSalary,
} from "@/app/actions/worker-onboarding";
import {
  ApplicationProfileEditor,
  type ApplicationProfileEditorHandle,
} from "@/components/application-profile-editor";
import { CvUploadField } from "@/components/cv-upload-field";
import { ProfilePhotosUpload } from "@/components/profile-photos-upload";
import { ProfileVisibilitySettings } from "@/components/profile-visibility-settings";
import { VideoUploadField } from "@/components/video-upload-field";
import { EMPLOYMENT_KIND_OPTIONS } from "@/lib/employment-kinds";
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
  { id: "application", title: "Bewerbungsprofil" },
  { id: "skills", title: "Kenntnisse" },
  { id: "languages", title: "Sprachen" },
  { id: "certificates", title: "Zertifikate" },
  { id: "files", title: "Dateien" },
  { id: "done", title: "Fertig" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

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
    | "socialLinkedin"
    | "socialXing"
    | "socialWebsite"
    | "profilePhotosJson"
    | "photoUrl"
    | "profileVisibilityJson"
    | "profileVisible"
    | "cvShareMode"
    | "applicationProfileJson"
    | "videoIntroUrl"
    | "cvPdfFilename"
  >;
};

export function WorkerProfileOnboarding({ profile }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applicationRef = useRef<ApplicationProfileEditorHandle>(null);
  const skillsRef = useRef<ApplicationProfileEditorHandle>(null);
  const languagesRef = useRef<ApplicationProfileEditorHandle>(null);
  const certificatesRef = useRef<ApplicationProfileEditorHandle>(null);

  const profilePhotos = parseWorkerProfilePhotos(profile.profilePhotosJson, profile.photoUrl);
  const visibility = parseProfileVisibility(profile.profileVisibilityJson, profile);
  const previewContext = {
    bio: profile.bio,
    contactPhone: profile.contactPhone,
    contactEmail: profile.contactEmail,
    socialLinkedin: profile.socialLinkedin,
    socialXing: profile.socialXing,
    socialWebsite: profile.socialWebsite,
  };

  const currentStep = STEPS[step];
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

  async function saveEditorAndNext(editor: React.RefObject<ApplicationProfileEditorHandle | null>) {
    setBusy(true);
    setError(null);
    const ok = (await editor.current?.save()) ?? false;
    setBusy(false);
    if (!ok) {
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
          <h1 className="mt-1 text-xl font-bold text-[var(--gj-text)]">{currentStep.title}</h1>
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
          <StepContent
            stepId={currentStep.id}
            profile={profile}
            profilePhotos={profilePhotos}
            visibility={visibility}
            previewContext={previewContext}
            applicationRef={applicationRef}
            skillsRef={skillsRef}
            languagesRef={languagesRef}
            certificatesRef={certificatesRef}
            busy={busy}
            onBack={goBack}
            onSkip={goNext}
            onSubmitStep={submitStep}
            onSaveEditor={saveEditorAndNext}
          />

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

function StepContent({
  stepId,
  profile,
  profilePhotos,
  visibility,
  previewContext,
  applicationRef,
  skillsRef,
  languagesRef,
  certificatesRef,
  busy,
  onBack,
  onSkip,
  onSubmitStep,
  onSaveEditor,
}: {
  stepId: StepId;
  profile: Props["profile"];
  profilePhotos: ReturnType<typeof parseWorkerProfilePhotos>;
  visibility: ReturnType<typeof parseProfileVisibility>;
  previewContext: {
    bio: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    socialLinkedin: string | null;
    socialXing: string | null;
    socialWebsite: string | null;
  };
  applicationRef: React.RefObject<ApplicationProfileEditorHandle | null>;
  skillsRef: React.RefObject<ApplicationProfileEditorHandle | null>;
  languagesRef: React.RefObject<ApplicationProfileEditorHandle | null>;
  certificatesRef: React.RefObject<ApplicationProfileEditorHandle | null>;
  busy: boolean;
  onBack: () => void;
  onSkip: () => void;
  onSubmitStep: (
    action: (fd: FormData) => Promise<{ ok: boolean }>,
    form: HTMLFormElement,
  ) => Promise<void>;
  onSaveEditor: (editor: React.RefObject<ApplicationProfileEditorHandle | null>) => Promise<void>;
}) {
  if (stepId === "welcome") {
    return (
      <div className="space-y-4">
        <p className="text-[var(--gj-text-secondary)]">
          Hallo <strong>{profile.displayName}</strong> — Ihr Konto ist angelegt. In den nächsten
          Schritten vervollständigen wir Ihr Profil, damit Arbeitgeber Sie finden können.
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
            <span>Fotos, Sichtbarkeit und Bewerbungsprofil</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600">○</span>
            <span>Kenntnisse, Sprachen, Zertifikate und Dateien</span>
          </li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={onSkip} className="gj-btn-primary">
            Los geht&apos;s
          </button>
          <Link href="/dashboard/worker" className="gj-btn-ghost">
            Überspringen
          </Link>
        </div>
      </div>
    );
  }

  if (stepId === "career") {
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmitStep(saveOnboardingCareer, e.currentTarget);
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
        <StepNav busy={busy} onBack={onBack} onSkip={onSkip} />
      </form>
    );
  }

  if (stepId === "salary") {
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmitStep(saveOnboardingSalary, e.currentTarget);
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
          <select name="salaryKind" className="gj-input" defaultValue={profile.salaryKind}>
            <option value="BRUTTO">Brutto</option>
            <option value="NETTO">Netto</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="salaryPublic" defaultChecked={profile.salaryPublic} />
          Gehaltswunsch öffentlich zeigen
        </label>
        <StepNav busy={busy} onBack={onBack} onSkip={onSkip} />
      </form>
    );
  }

  if (stepId === "contact") {
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmitStep(saveOnboardingContact, e.currentTarget);
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
        <StepNav busy={busy} onBack={onBack} onSkip={onSkip} />
      </form>
    );
  }

  if (stepId === "photos") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--gj-muted)]">
          Mehrere Fotos möglich — Arbeitgeber sehen sie oben in Ihrem Profil.
        </p>
        <ProfilePhotosUpload initialPhotos={profilePhotos} />
        <StepNav busy={busy} onBack={onBack} onSkip={onSkip} showSave={false} />
      </div>
    );
  }

  if (stepId === "visibility") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--gj-muted)]">
          Legen Sie fest, was Arbeitgeber sofort sehen und was erst nach Match freigegeben wird.
        </p>
        <ProfileVisibilitySettings initial={visibility} />
        <StepNav busy={busy} onBack={onBack} onSkip={onSkip} showSave={false} />
      </div>
    );
  }

  if (stepId === "application") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--gj-muted)]">
          Werdegang und Ausbildung — wie im Bewerbungsprofil auf der Profil-Seite.
        </p>
        <ApplicationProfileEditor
          ref={applicationRef}
          initialJson={profile.applicationProfileJson}
          previewContext={previewContext}
          sections={["headline", "experiences", "education"]}
          compact
          hideSaveButton
        />
        <StepNav
          busy={busy}
          onBack={onBack}
          onSkip={onSkip}
          onSave={() => void onSaveEditor(applicationRef)}
        />
      </div>
    );
  }

  if (stepId === "skills") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--gj-muted)]">
          Fähigkeiten und Kenntnisse — eine pro Zeile.
        </p>
        <ApplicationProfileEditor
          ref={skillsRef}
          initialJson={profile.applicationProfileJson}
          previewContext={previewContext}
          sections={["skills"]}
          compact
          hideSaveButton
        />
        <StepNav
          busy={busy}
          onBack={onBack}
          onSkip={onSkip}
          onSave={() => void onSaveEditor(skillsRef)}
        />
      </div>
    );
  }

  if (stepId === "languages") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--gj-muted)]">
          Sprachen mit Niveau, z. B. „Deutsch (Muttersprache)“.
        </p>
        <ApplicationProfileEditor
          ref={languagesRef}
          initialJson={profile.applicationProfileJson}
          previewContext={previewContext}
          sections={["languages"]}
          compact
          hideSaveButton
        />
        <StepNav
          busy={busy}
          onBack={onBack}
          onSkip={onSkip}
          onSave={() => void onSaveEditor(languagesRef)}
        />
      </div>
    );
  }

  if (stepId === "certificates") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--gj-muted)]">
          Zertifikate, Weiterbildungen und Qualifikationen.
        </p>
        <ApplicationProfileEditor
          ref={certificatesRef}
          initialJson={profile.applicationProfileJson}
          previewContext={previewContext}
          sections={["certificates"]}
          compact
          hideSaveButton
        />
        <StepNav
          busy={busy}
          onBack={onBack}
          onSkip={onSkip}
          onSave={() => void onSaveEditor(certificatesRef)}
        />
      </div>
    );
  }

  if (stepId === "files") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--gj-muted)]">
          Optional PDF-Lebenslauf und Kurzvideo — Freigabe über die Sichtbarkeitseinstellungen.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <CvUploadField />
          <VideoUploadField />
        </div>
        {profile.cvPdfFilename ? (
          <p className="text-sm text-emerald-800">
            PDF-Lebenslauf bereits hochgeladen ({profile.cvPdfFilename}).
          </p>
        ) : null}
        {profile.videoIntroUrl ? (
          <video
            key={profile.videoIntroUrl}
            className="w-full max-w-md rounded-xl border border-[var(--gj-border)]"
            controls
            src={profile.videoIntroUrl}
          />
        ) : null}
        <StepNav busy={busy} onBack={onBack} onSkip={onSkip} showSave={false} />
      </div>
    );
  }

  return (
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
  );
}

function StepNav({
  busy,
  onBack,
  onSkip,
  onSave,
  showSave = true,
}: {
  busy: boolean;
  onBack: () => void;
  onSkip: () => void;
  onSave?: () => void;
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
        <button
          type={onSave ? "button" : "submit"}
          disabled={busy}
          onClick={onSave}
          className="gj-btn-primary ml-auto"
        >
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
