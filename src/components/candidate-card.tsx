"use client";

import { useState } from "react";
import { ChatIcon, ClockIcon, EuroIcon, MapPinIcon, UserIcon } from "@/components/icons";

export type CandidateCardData = {
  id: string;
  professionField: string;
  experienceYears: number;
  region: string;
  availability: string;
  salaryExpectation: number | null;
  anonymousSlug: string;
  bioPreview: string | null;
  photoUrl: string | null;
};

export function CandidateCard({ data }: { data: CandidateCardData }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function contact() {
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
    <article className="gj-card relative overflow-hidden p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--gj-primary-soft)] text-[var(--gj-primary)]">
          {data.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserIcon />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-[var(--gj-text)]">{data.professionField}</h3>
          <p className="mt-1 text-xs text-[var(--gj-muted)]">Anonymes Profil · /p/{data.anonymousSlug}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="gj-chip gj-chip-neutral">
          <MapPinIcon /> {data.region}
        </span>
        <span className="gj-chip gj-chip-neutral">
          <ClockIcon /> {data.availability}
        </span>
        <span className="gj-chip">
          {data.experienceYears} J. Erfahrung
        </span>
        {data.salaryExpectation != null ? (
          <span className="gj-chip gj-chip-neutral">
            <EuroIcon /> {data.salaryExpectation.toLocaleString("de-DE")} €
          </span>
        ) : null}
      </div>

      {data.bioPreview ? (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[var(--gj-text)]/80">
          {data.bioPreview}…
        </p>
      ) : (
        <p className="mt-4 text-sm italic text-[var(--gj-muted)]">Kein Kurzprofil hinterlegt.</p>
      )}

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[var(--gj-border)] pt-4">
        <a
          href={`/p/${data.anonymousSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gj-btn-ghost"
        >
          Profil ansehen
        </a>
        <button
          type="button"
          disabled={busy || sent}
          onClick={() => void contact()}
          className="gj-btn-primary"
        >
          <ChatIcon /> {sent ? "Anfrage gesendet" : busy ? "Sende…" : "Kontakt aufnehmen"}
        </button>
      </div>
    </article>
  );
}
