import type { CvShareMode, WorkerProfile } from "@prisma/client";
import { emptyApplicationProfile } from "@/lib/application-profile";

export type SectionVisibility = "PUBLIC" | "ON_REQUEST" | "HIDDEN";

export type WorkerProfileVisibilitySettings = {
  version: 1;
  talentSearch: boolean;
  salary: "PUBLIC" | "HIDDEN";
  photos: SectionVisibility;
  contact: SectionVisibility;
  application: SectionVisibility;
  bio: SectionVisibility;
  video: SectionVisibility;
  cv: CvShareMode;
};

export const VISIBILITY_SECTION_LABELS: Record<
  keyof Omit<WorkerProfileVisibilitySettings, "version" | "talentSearch" | "cv" | "salary">,
  { title: string; hint: string }
> = {
  photos: {
    title: "Profilfotos",
    hint: "Ihre Bilder im Kandidatenprofil.",
  },
  contact: {
    title: "Kontaktdaten",
    hint: "Telefon, E-Mail, LinkedIn, XING, Website.",
  },
  application: {
    title: "Bewerbungsprofil",
    hint: "Werdegang, Fähigkeiten, Ausbildung, Zertifikate.",
  },
  bio: {
    title: "Über mich (Kurztext)",
    hint: "Ihr persönlicher Einleitungstext.",
  },
  video: {
    title: "Kurzvideo",
    hint: "Video-Vorstellung aus dem Dateien-Bereich.",
  },
};

export function defaultVisibilityFromProfile(
  profile: Pick<WorkerProfile, "profileVisible" | "salaryPublic" | "cvShareMode">,
): WorkerProfileVisibilitySettings {
  return {
    version: 1,
    talentSearch: profile.profileVisible,
    salary: profile.salaryPublic ? "PUBLIC" : "HIDDEN",
    photos: "PUBLIC",
    contact: "PUBLIC",
    application: "PUBLIC",
    bio: "PUBLIC",
    video: "ON_REQUEST",
    cv: profile.cvShareMode,
  };
}

export function parseProfileVisibility(
  json: string | null | undefined,
  profile: Pick<WorkerProfile, "profileVisible" | "salaryPublic" | "cvShareMode">,
): WorkerProfileVisibilitySettings {
  const fallback = defaultVisibilityFromProfile(profile);
  if (!json?.trim()) return fallback;
  try {
    const raw = JSON.parse(json) as Partial<WorkerProfileVisibilitySettings>;
    if (raw.version !== 1) return fallback;
    return {
      version: 1,
      talentSearch: raw.talentSearch ?? fallback.talentSearch,
      salary: raw.salary === "HIDDEN" ? "HIDDEN" : "PUBLIC",
      photos: isSectionVisibility(raw.photos) ? raw.photos : fallback.photos,
      contact: isSectionVisibility(raw.contact) ? raw.contact : fallback.contact,
      application: isSectionVisibility(raw.application) ? raw.application : fallback.application,
      bio: isSectionVisibility(raw.bio) ? raw.bio : fallback.bio,
      video: isSectionVisibility(raw.video) ? raw.video : fallback.video,
      cv: raw.cv === "IMMEDIATE" || raw.cv === "ON_REQUEST" ? raw.cv : fallback.cv,
    };
  } catch {
    return fallback;
  }
}

function isSectionVisibility(v: unknown): v is SectionVisibility {
  return v === "PUBLIC" || v === "ON_REQUEST" || v === "HIDDEN";
}

export function serializeProfileVisibility(settings: WorkerProfileVisibilitySettings): string {
  return JSON.stringify(settings);
}

/** Darf ein Arbeitgeber diesen Abschnitt sehen? */
export function employerMayViewSection(
  mode: SectionVisibility,
  matchAccepted: boolean,
): boolean {
  if (mode === "HIDDEN") return false;
  if (mode === "PUBLIC") return true;
  return matchAccepted;
}

export function visibilityToDbFields(settings: WorkerProfileVisibilitySettings): {
  profileVisible: boolean;
  salaryPublic: boolean;
  cvShareMode: CvShareMode;
  profileVisibilityJson: string;
} {
  return {
    profileVisible: settings.talentSearch,
    salaryPublic: settings.salary === "PUBLIC",
    cvShareMode: settings.cv,
    profileVisibilityJson: serializeProfileVisibility(settings),
  };
}

export function emptyApplicationForVisibility() {
  return emptyApplicationProfile();
}
