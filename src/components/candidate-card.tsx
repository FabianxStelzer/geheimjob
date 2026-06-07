"use client";

import { useState } from "react";
import { ChatIcon, ClockIcon, EuroIcon, MapPinIcon, UserIcon } from "@/components/icons";

export type CandidateCardData = {
  id: string;
  displayName: string;
  professionField: string;
  experienceYears: number;
  region: string;
  availability: string;
  employmentKind: string | null;
  salaryExpectation: number | null;
  anonymousSlug: string;
  bioPreview: string | null;
  photoUrl: string | null;
};

export function CandidateCard({
  data,
  onOpen,
}: {
  data: CandidateCardData;
  onOpen: (data: CandidateCardData) => void;
}) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function contact(e: React.MouseEvent) {
    e.stopPropagation();
    setBusy(true);
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerProfileId: data.id,
        introMessage: "Wir möchten Sie gerne kennenlernen.",
      }),
    });
    setBusy(false);
    if (res.ok) {
      setSent(true);
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      alert(j.error || "Anfrage fehlgeschlagen.");
    }
  }

  return (
    <article className="gj-card gj-card-interactive overflow-hidden p-0 shadow-sm">
      <button
        type="button"
        onClick={() => onOpen(data)}
        className="block w-full p-5 text-left"
      >
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--gj-primary-soft)] text-[var(--gj-primary)] ring-2 ring-[var(--gj-primary-soft)]">
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserIcon />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-snug text-[var(--gj-text)]">
                  {data.displayName}
                </h3>
                <p className="mt-0.5 truncate text-xs text-[var(--gj-muted)]">
                  {data.professionField}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-[var(--gj-primary-softer)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--gj-primary)]">
                Detail
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--gj-muted)]">
              {data.region} · {data.experienceYears} J.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="gj-chip gj-chip-neutral text-[11px]">
            <MapPinIcon /> {data.region}
          </span>
          <span className="gj-chip gj-chip-neutral text-[11px]">
            <ClockIcon /> {data.availability}
          </span>
          {data.employmentKind ? (
            <span className="gj-chip gj-chip-neutral text-[11px]">{data.employmentKind}</span>
          ) : null}
          {data.salaryExpectation != null ? (
            <span className="gj-chip gj-chip-neutral text-[11px]">
              <EuroIcon /> {data.salaryExpectation.toLocaleString("de-DE")} €
            </span>
          ) : null}
        </div>

        {data.bioPreview ? (
          <p className="mt-3 line-clamp-2 text-[11px] italic text-[var(--gj-text)]/75">
            “{data.bioPreview}…”
          </p>
        ) : null}
      </button>

      <div className="flex items-center justify-end gap-2 border-t border-[var(--gj-border)] px-4 py-3">
        <button
          type="button"
          disabled={busy || sent}
          onClick={(e) => void contact(e)}
          className="gj-btn-primary text-sm"
        >
          <ChatIcon /> {sent ? "Gesendet" : busy ? "Sende…" : "Kontakt"}
        </button>
      </div>
    </article>
  );
}
