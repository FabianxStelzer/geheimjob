import type { CvShareMode, MatchRequest, WorkerProfile } from "@prisma/client";
import { parseCvDraft, type CvDraft } from "@/lib/cv-draft";

function draftHasContent(draft: CvDraft): boolean {
  if (draft.summary.trim() || draft.headline.trim()) return true;
  if (draft.skills.length || draft.languages.length || draft.certificates.length) return true;
  if (draft.experiences.some((e) => e.company.trim() || e.role.trim())) return true;
  if (draft.education.some((e) => e.institution.trim() || e.degree.trim())) return true;
  return false;
}

export function workerHasCv(
  worker: Pick<WorkerProfile, "cvPdfFilename" | "cvDraftJson">,
): boolean {
  if (worker.cvPdfFilename) return true;
  if (!worker.cvDraftJson?.trim()) return false;
  return draftHasContent(parseCvDraft(worker.cvDraftJson));
}

export function employerMayAccessCv(
  match: Pick<MatchRequest, "status" | "cvGrantedAt">,
  worker: Pick<WorkerProfile, "cvShareMode" | "cvPdfFilename" | "cvDraftJson">,
): boolean {
  if (match.status !== "ACCEPTED") return false;
  if (!workerHasCv(worker)) return false;
  if (worker.cvShareMode === "IMMEDIATE") return true;
  return match.cvGrantedAt != null;
}

export type CvAccessUiState = {
  hasCv: boolean;
  shareMode: CvShareMode;
  canView: boolean;
  requested: boolean;
  granted: boolean;
  pendingWorkerApproval: boolean;
};

export function cvAccessUiState(
  match: Pick<MatchRequest, "status" | "cvRequestedAt" | "cvGrantedAt">,
  worker: Pick<WorkerProfile, "cvShareMode" | "cvPdfFilename" | "cvDraftJson">,
): CvAccessUiState {
  const hasCv = workerHasCv(worker);
  const shareMode = worker.cvShareMode;
  const granted = match.cvGrantedAt != null;
  const requested = match.cvRequestedAt != null;
  const canView = employerMayAccessCv(match, worker);
  const pendingWorkerApproval =
    shareMode === "ON_REQUEST" &&
    match.status === "ACCEPTED" &&
    requested &&
    !granted &&
    hasCv;

  return {
    hasCv,
    shareMode,
    canView,
    requested,
    granted,
    pendingWorkerApproval,
  };
}
