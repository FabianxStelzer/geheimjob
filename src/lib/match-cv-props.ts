import { cvAccessUiState } from "@/lib/cv-access";
import type { CvAccessUiState } from "@/lib/cv-access";
import type { MatchRequest, WorkerProfile } from "@prisma/client";

export function buildMatchCvFields(
  match: Pick<MatchRequest, "status" | "cvRequestedAt" | "cvGrantedAt">,
  worker: Pick<WorkerProfile, "cvShareMode" | "cvPdfFilename" | "cvDraftJson">,
): {
  cvAccess: CvAccessUiState;
  hasPdf: boolean;
  cvDraftJson: string | null;
} {
  return {
    cvAccess: cvAccessUiState(match, worker),
    hasPdf: !!worker.cvPdfFilename,
    cvDraftJson: worker.cvDraftJson,
  };
}
