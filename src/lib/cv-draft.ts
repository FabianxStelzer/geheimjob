export type CvExperience = {
  id: string;
  company: string;
  role: string;
  location: string;
  from: string;
  to: string;
  description: string;
};

export type CvEducation = {
  id: string;
  institution: string;
  degree: string;
  from: string;
  to: string;
  description: string;
};

export type CvDraft = {
  version: 1;
  headline: string;
  summary: string;
  skills: string[];
  languages: string[];
  experiences: CvExperience[];
  education: CvEducation[];
  certificates: string[];
};

export function emptyCvDraft(): CvDraft {
  return {
    version: 1,
    headline: "",
    summary: "",
    skills: [],
    languages: [],
    experiences: [],
    education: [],
    certificates: [],
  };
}

function newId() {
  return `cv_${Math.random().toString(36).slice(2, 10)}`;
}

export function newExperience(): CvExperience {
  return {
    id: newId(),
    company: "",
    role: "",
    location: "",
    from: "",
    to: "",
    description: "",
  };
}

export function newEducation(): CvEducation {
  return {
    id: newId(),
    institution: "",
    degree: "",
    from: "",
    to: "",
    description: "",
  };
}

function parseStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function parseCvDraft(json: string | null | undefined): CvDraft {
  if (!json?.trim()) return emptyCvDraft();
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    if (raw.version === 1 && Array.isArray(raw.experiences)) {
      return {
        version: 1,
        headline: String(raw.headline ?? ""),
        summary: String(raw.summary ?? ""),
        skills: parseStringList(raw.skills),
        languages: parseStringList(raw.languages),
        experiences: (raw.experiences as CvExperience[]).map((e) => ({
          id: String(e.id || newId()),
          company: String(e.company ?? ""),
          role: String(e.role ?? ""),
          location: String(e.location ?? ""),
          from: String(e.from ?? ""),
          to: String(e.to ?? ""),
          description: String(e.description ?? ""),
        })),
        education: Array.isArray(raw.education)
          ? (raw.education as CvEducation[]).map((e) => ({
              id: String(e.id || newId()),
              institution: String(e.institution ?? ""),
              degree: String(e.degree ?? ""),
              from: String(e.from ?? ""),
              to: String(e.to ?? ""),
              description: String(e.description ?? ""),
            }))
          : [],
        certificates: parseStringList(raw.certificates),
      };
    }
    const legacySkills = parseStringList(raw.skills);
    const beruf = String(raw.beruf ?? raw.profession ?? "");
    return {
      ...emptyCvDraft(),
      headline: beruf,
      summary: String(raw.summary ?? raw.bio ?? ""),
      skills: legacySkills,
    };
  } catch {
    return emptyCvDraft();
  }
}

export function serializeCvDraft(draft: CvDraft): string {
  return JSON.stringify(draft);
}

export function splitLinesInput(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinLinesInput(items: string[]): string {
  return items.join("\n");
}
