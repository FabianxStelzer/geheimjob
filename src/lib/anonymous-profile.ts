import type { CvAccessUiState } from "@/lib/cv-access";

export type EmployerMatchCvContext = {
  id: string;
  status: "PENDING" | "ACCEPTED";
  cvAccess: CvAccessUiState;
};

export type PublicAnonymousProfile = {
  professionField: string;
  region: string;
  experienceYears: number;
  availability: string;
  salaryExpectation: number | null;
  salaryPublic: boolean;
  bio: string | null;
  photoUrl: string | null;
  cvShareMode: "IMMEDIATE" | "ON_REQUEST";
  hasCv: boolean;
  cvDraftJson: string | null;
  employerMatch: EmployerMatchCvContext | null;
};
