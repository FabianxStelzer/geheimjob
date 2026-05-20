import type { HiringStage, MatchStatus } from "@prisma/client";

export type PipelineBoardColumn =
  | "AUSSTEHEND"
  | "BEWORBEN"
  | "EINGELADEN"
  | "INTERVIEW"
  | "ENTSCHEIDUNG"
  | "EINGESTELLT"
  | "ABGELEHNT";

const COL_META: Record<
  PipelineBoardColumn,
  { label: string; accent: string }
> = {
  AUSSTEHEND: { label: "Ausstehend · Match", accent: "bg-violet-500" },
  BEWORBEN: { label: "Beworben", accent: "bg-slate-500" },
  EINGELADEN: { label: "Eingeladen", accent: "bg-amber-400" },
  INTERVIEW: { label: "Interview", accent: "bg-sky-500" },
  ENTSCHEIDUNG: { label: "Entscheidung", accent: "bg-indigo-500" },
  EINGESTELLT: { label: "Eingestellt", accent: "bg-emerald-500" },
  ABGELEHNT: { label: "Abgelehnt · Zurück", accent: "bg-rose-500" },
};

export function listPipelineBoardColumns(): {
  key: PipelineBoardColumn;
  label: string;
  accent: string;
}[] {
  return (Object.keys(COL_META) as PipelineBoardColumn[]).map((key) => ({
    key,
    ...COL_META[key],
  }));
}

/** Spalten-Zuordnung für Kanban (nach Match-Bestätigung: Bewerbungspipeline). */
export function pipelineColumnForMatch(match: {
  status: MatchStatus;
  hiringStage: HiringStage;
}): PipelineBoardColumn {
  if (match.status === "REJECTED" || match.status === "WITHDRAWN") return "ABGELEHNT";
  if (match.status === "PENDING") return "AUSSTEHEND";
  if (match.status === "ACCEPTED") {
    switch (match.hiringStage) {
      case "EINGESTELLT":
        return "EINGESTELLT";
      case "ENTSCHEIDUNG":
        return "ENTSCHEIDUNG";
      case "INTERVIEW":
        return "INTERVIEW";
      case "EINGELADEN":
        return "EINGELADEN";
      case "BEWORBEN":
      case "NONE":
      default:
        return "BEWORBEN";
    }
  }
  return "ABGELEHNT";
}

export const HIRING_STAGE_SEQUENCE: HiringStage[] = [
  "BEWORBEN",
  "EINGELADEN",
  "INTERVIEW",
  "ENTSCHEIDUNG",
  "EINGESTELLT",
];
