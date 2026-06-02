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
};
