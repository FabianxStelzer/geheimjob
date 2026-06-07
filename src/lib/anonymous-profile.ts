import type { CvAccessUiState } from "@/lib/cv-access";
import type { ApplicationProfile } from "@/lib/application-profile";

export type EmployerMatchCvContext = {
  id: string;
  status: "PENDING" | "ACCEPTED";
  cvAccess: CvAccessUiState;
};

/** Profilansicht für Arbeitgeber im Talentpool */
export type PublicTalentProfile = {
  displayName: string;
  professionField: string;
  region: string;
  experienceYears: number;
  availability: string;
  employmentKind: string | null;
  salaryExpectation: number | null;
  salaryPublic: boolean;
  bio: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  socialLinkedin: string | null;
  socialXing: string | null;
  socialWebsite: string | null;
  photoUrls: string[];
  application: ApplicationProfile;
  cvShareMode: "IMMEDIATE" | "ON_REQUEST";
  hasCv: boolean;
  cvDraftJson: string | null;
  cvPdfAvailable: boolean;
  employerMatch: EmployerMatchCvContext | null;
};

/** @deprecated Alias für bestehenden Import */
export type PublicAnonymousProfile = PublicTalentProfile;
