"use client";

import { useState } from "react";
import { saveCvShareMode } from "@/app/actions/cv";
import type { CvShareMode } from "@prisma/client";

export function CvShareModeSettings({ currentMode }: { currentMode: CvShareMode }) {
  const [mode, setMode] = useState(currentMode);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setStatus(null);
    const res = await saveCvShareMode(mode);
    setBusy(false);
    setStatus(res.ok ? "Einstellung gespeichert." : res.error ?? "Fehler.");
  }

  return (
    <fieldset className="rounded-xl border border-[var(--gj-border)] bg-[var(--gj-bg)]/50 p-4">
      <legend className="gj-label px-1">Sichtbarkeit für Unternehmen</legend>
      <div className="mt-3 space-y-3">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--gj-border)] bg-white p-3 has-[:checked]:border-[var(--gj-primary)] has-[:checked]:ring-2 has-[:checked]:ring-[var(--gj-primary)]/20">
          <input
            type="radio"
            name="cvShareModeSetting"
            checked={mode === "IMMEDIATE"}
            onChange={() => setMode("IMMEDIATE")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-semibold text-[var(--gj-text)]">
              Sofort nach Match anzeigen
            </span>
            <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">
              Arbeitgeber sehen den Lebenslauf direkt nach angenommenem Match.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--gj-border)] bg-white p-3 has-[:checked]:border-[var(--gj-primary)] has-[:checked]:ring-2 has-[:checked]:ring-[var(--gj-primary)]/20">
          <input
            type="radio"
            name="cvShareModeSetting"
            checked={mode === "ON_REQUEST"}
            onChange={() => setMode("ON_REQUEST")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-semibold text-[var(--gj-text)]">
              Erst nach meiner Freigabe
            </span>
            <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">
              Pro Unternehmen „Lebenslauf anfordern“ — Sie geben per Klick frei.
            </span>
          </span>
        </label>
      </div>
      <button
        type="button"
        disabled={busy || mode === currentMode}
        onClick={() => void save()}
        className="gj-btn-ghost mt-3 text-sm"
      >
        {busy ? "Speichern…" : "Einstellung speichern"}
      </button>
      {status ? <p className="mt-2 text-xs text-[var(--gj-muted)]">{status}</p> : null}
    </fieldset>
  );
}
