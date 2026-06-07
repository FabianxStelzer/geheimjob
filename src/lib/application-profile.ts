import {
  newEducation,
  newExperience,
  parseStringList,
  type CvEducation,
  type CvExperience,
} from "@/lib/cv-draft";

export type ApplicationProfile = {
  version: 1;
  headline: string;
  skills: string[];
  languages: string[];
  experiences: CvExperience[];
  education: CvEducation[];
  certificates: string[];
  interests: string[];
};

export function emptyApplicationProfile(): ApplicationProfile {
  return {
    version: 1,
    headline: "",
    skills: [],
    languages: [],
    experiences: [],
    education: [],
    certificates: [],
    interests: [],
  };
}

export function parseApplicationProfile(json: string | null | undefined): ApplicationProfile {
  if (!json?.trim()) return emptyApplicationProfile();
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    if (raw.version === 1) {
      return {
        version: 1,
        headline: String(raw.headline ?? ""),
        skills: parseStringList(raw.skills),
        languages: parseStringList(raw.languages),
        interests: parseStringList(raw.interests),
        certificates: parseStringList(raw.certificates),
        experiences: Array.isArray(raw.experiences)
          ? (raw.experiences as CvExperience[]).map((e) => ({
              id: String(e.id || `ap_${Math.random().toString(36).slice(2, 10)}`),
              company: String(e.company ?? ""),
              role: String(e.role ?? ""),
              location: String(e.location ?? ""),
              from: String(e.from ?? ""),
              to: String(e.to ?? ""),
              description: String(e.description ?? ""),
            }))
          : [],
        education: Array.isArray(raw.education)
          ? (raw.education as CvEducation[]).map((e) => ({
              id: String(e.id || `ap_${Math.random().toString(36).slice(2, 10)}`),
              institution: String(e.institution ?? ""),
              degree: String(e.degree ?? ""),
              from: String(e.from ?? ""),
              to: String(e.to ?? ""),
              description: String(e.description ?? ""),
            }))
          : [],
      };
    }
  } catch {
    /* fall through */
  }
  return emptyApplicationProfile();
}

export function serializeApplicationProfile(profile: ApplicationProfile): string {
  return JSON.stringify(profile);
}

export function applicationProfileHasContent(profile: ApplicationProfile): boolean {
  if (profile.headline.trim()) return true;
  if (
    profile.skills.length ||
    profile.languages.length ||
    profile.certificates.length ||
    profile.interests.length
  ) {
    return true;
  }
  if (profile.experiences.some((e) => e.company.trim() || e.role.trim())) return true;
  if (profile.education.some((e) => e.institution.trim() || e.degree.trim())) return true;
  return false;
}

export { newEducation, newExperience };
