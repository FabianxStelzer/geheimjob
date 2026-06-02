"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CvDraftPreview } from "@/components/cv-draft-preview";
import type { CvAccessUiState } from "@/lib/cv-access";
export type MatchCvAccessProps = {
  matchId: string;
  viewerRole: "WORKER" | "EMPLOYER";
  status: string;
  cvAccess: CvAccessUiState;
  hasPdf: boolean;
  cvDraftJson: string | null;
  workerMeta: {
    displayName: string;
    professionField: string;
    region: string;
  };
  employerCompanyName?: string;
};

export function MatchCvAccess({
  matchId,
  viewerRole,
  status,
  cvAccess,
  hasPdf,
  cvDraftJson,
  workerMeta,
  employerCompanyName,
}: MatchCvAccessProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (status !== "ACCEPTED") return null;
  if (!cvAccess.hasCv) {
    return (
      <p className="text-sm text-[var(--gj-muted)]">Kein Lebenslauf vom Kandidaten hinterlegt.</p>
    );
  }

  async function requestCv() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/matches/${matchId}/cv-request`, { method: "POST" });
    const data = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Anfrage fehlgeschlagen.");
      return;
    }
    setMsg("Anfrage gesendet. Der Kandidat wird benachrichtigt.");
    router.refresh();
  }

  async function grantCv() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/matches/${matchId}/cv-grant`, { method: "POST" });
    const data = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Freigabe fehlgeschlagen.");
      return;
    }
    setMsg("Lebenslauf für dieses Unternehmen freigegeben.");
    router.refresh();
  }

  return (
    <section className="space-y-3 border-t border-[var(--gj-border)] pt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--gj-muted)]">
        Lebenslauf
      </h4>

      {viewerRole === "WORKER" && cvAccess.pendingWorkerApproval ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p>
            <strong>{employerCompanyName ?? "Unternehmen"}</strong> möchte Ihren Lebenslauf einsehen.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void grantCv()}
            className="gj-btn-primary mt-3"
          >
            {busy ? "…" : "Lebenslauf freigeben"}
          </button>
        </div>
      ) : null}

      {viewerRole === "EMPLOYER" ? (
        <EmployerCvPanel
          cvAccess={cvAccess}
          matchId={matchId}
          hasPdf={hasPdf}
          busy={busy}
          onRequest={() => void requestCv()}
        />
      ) : null}

      {viewerRole === "EMPLOYER" && cvAccess.canView && cvDraftJson ? (
        <CvDraftPreview draftJson={cvDraftJson} meta={workerMeta} />
      ) : null}

      {viewerRole === "WORKER" && cvAccess.shareMode === "ON_REQUEST" && cvAccess.granted ? (
        <p className="text-xs text-[var(--gj-muted)]">
          Lebenslauf für {employerCompanyName ?? "dieses Unternehmen"} freigegeben.
        </p>
      ) : null}

      {msg ? (
        <p
          className={`text-sm ${msg.includes("freigegeben") || msg.includes("gesendet") ? "text-emerald-700" : "text-rose-700"}`}
        >
          {msg}
        </p>
      ) : null}
    </section>
  );
}

function EmployerCvPanel({
  cvAccess,
  matchId,
  hasPdf,
  busy,
  onRequest,
}: {
  cvAccess: CvAccessUiState;
  matchId: string;
  hasPdf: boolean;
  busy: boolean;
  onRequest: () => void;
}) {
  if (cvAccess.canView) {
    return (
      <div className="flex flex-wrap gap-2">
        {hasPdf ? (
          <a
            href={`/api/cv/match/${matchId}`}
            target="_blank"
            rel="noreferrer"
            className="gj-btn-primary"
          >
            PDF herunterladen
          </a>
        ) : null}
        <p className="w-full text-xs text-[var(--gj-muted)]">
          {cvAccess.shareMode === "IMMEDIATE"
            ? "Der Kandidat stellt den Lebenslauf nach Match automatisch bereit."
            : "Der Kandidat hat den Lebenslauf freigegeben."}
        </p>
      </div>
    );
  }

  if (cvAccess.shareMode === "ON_REQUEST") {
    if (cvAccess.pendingWorkerApproval || cvAccess.requested) {
      return (
        <p className="rounded-lg border border-[var(--gj-border)] bg-[var(--gj-bg)] px-3 py-2 text-sm text-[var(--gj-muted)]">
          Anfrage gesendet — wartet auf Freigabe durch den Kandidaten.
        </p>
      );
    }
    return (
      <button type="button" disabled={busy} onClick={onRequest} className="gj-btn-primary">
        {busy ? "Senden…" : "Lebenslauf anfordern"}
      </button>
    );
  }

  return null;
}
