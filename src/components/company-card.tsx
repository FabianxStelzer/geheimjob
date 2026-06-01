"use client";

import { useState } from "react";
import { BrandAvatar } from "@/components/brand-logo";
import { BriefcaseIcon, ChatIcon, MapPinIcon } from "@/components/icons";

export type CompanyCardData = {
  id: string;
  companyName: string;
  industry: string;
  region: string;
  openPositionsNote: string | null;
  isNew?: boolean;
};

export function CompanyCard({ data }: { data: CompanyCardData }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function apply() {
    setBusy(true);
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employerProfileId: data.id,
        introMessage: "Ich möchte mich bei Ihnen vorstellen.",
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

  const initial = data.companyName.slice(0, 2).toUpperCase();

  return (
    <article className="gj-card gj-card-interactive relative overflow-hidden p-5">
      {data.isNew ? <div className="gj-ribbon">Neu</div> : null}

      <div className="flex items-start gap-4">
        <BrandAvatar className="h-12 w-12 text-sm">{initial}</BrandAvatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-[var(--gj-text)]">
            {data.companyName}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--gj-muted)]">
            <MapPinIcon /> {data.region}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="gj-chip">
          <BriefcaseIcon className="h-3.5 w-3.5" /> {data.industry}
        </span>
      </div>

      {data.openPositionsNote ? (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[var(--gj-text)]/80">
          {data.openPositionsNote}
        </p>
      ) : (
        <p className="mt-4 text-sm italic text-[var(--gj-muted)]">Keine Stellenbeschreibung hinterlegt.</p>
      )}

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-[var(--gj-border)] pt-4">
        <button
          type="button"
          disabled={busy || sent}
          onClick={() => void apply()}
          className="gj-btn-primary"
        >
          <ChatIcon /> {sent ? "Anfrage gesendet" : busy ? "Sende…" : "Interesse zeigen"}
        </button>
      </div>
    </article>
  );
}
