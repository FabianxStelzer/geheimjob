"use client";

import { useState } from "react";
import { updateProfileVisibility } from "@/app/actions/profile-visibility";
import {
  VISIBILITY_SECTION_LABELS,
  type SectionVisibility,
  type WorkerProfileVisibilitySettings,
} from "@/lib/worker-profile-visibility";
import type { CvShareMode } from "@prisma/client";

const SECTION_KEYS = ["photos", "contact", "application", "bio", "video"] as const;

function VisibilitySelect({
  name,
  value,
  onChange,
}: {
  name: string;
  value: SectionVisibility;
  onChange: (v: SectionVisibility) => void;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value as SectionVisibility)}
      className="gj-input text-sm"
    >
      <option value="PUBLIC">Sofort sichtbar</option>
      <option value="ON_REQUEST">Erst nach Match / auf Anfrage</option>
      <option value="HIDDEN">Nicht anzeigen</option>
    </select>
  );
}

export function ProfileVisibilitySettings({
  initial,
}: {
  initial: WorkerProfileVisibilitySettings;
}) {
  const [settings, setSettings] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await updateProfileVisibility(formData);
    setBusy(false);
    setStatus(res.ok ? "Sichtbarkeit gespeichert." : "Speichern fehlgeschlagen.");
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div className="rounded-xl border border-[var(--gj-primary)]/20 bg-[var(--gj-primary-softer)]/25 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="vis_talentSearch"
            defaultChecked={settings.talentSearch}
            className="mt-1 h-4 w-4"
          />
          <span>
            <span className="block text-sm font-semibold text-[var(--gj-text)]">
              Im Talentpool auffindbar
            </span>
            <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">
              Arbeitgeber können Sie in der Kandidatensuche finden. Aus = Profil komplett verborgen.
            </span>
          </span>
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--gj-border)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--gj-border)] bg-[var(--gj-bg)] text-xs uppercase text-[var(--gj-muted)]">
              <th className="px-4 py-3 font-medium">Bereich</th>
              <th className="px-4 py-3 font-medium">Sichtbarkeit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--gj-border)]">
            {SECTION_KEYS.map((key) => {
              const meta = VISIBILITY_SECTION_LABELS[key];
              return (
                <tr key={key}>
                  <td className="px-4 py-3 align-top">
                    <span className="font-medium text-[var(--gj-text)]">{meta.title}</span>
                    <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">{meta.hint}</span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <VisibilitySelect
                      name={`vis_${key}`}
                      value={settings[key]}
                      onChange={(v) => setSettings((s) => ({ ...s, [key]: v }))}
                    />
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="px-4 py-3 align-top">
                <span className="font-medium text-[var(--gj-text)]">Gehaltswunsch</span>
                <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">
                  Nur sichtbar, wenn Gehalt im Stammdaten hinterlegt ist.
                </span>
              </td>
              <td className="px-4 py-3 align-top">
                <select
                  name="vis_salary"
                  value={settings.salary}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      salary: e.target.value === "HIDDEN" ? "HIDDEN" : "PUBLIC",
                    }))
                  }
                  className="gj-input text-sm"
                >
                  <option value="PUBLIC">Sofort sichtbar</option>
                  <option value="HIDDEN">Nicht anzeigen</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 align-top">
                <span className="font-medium text-[var(--gj-text)]">Lebenslauf (PDF / Builder)</span>
                <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">
                  Vollständiger CV — getrennt vom Bewerbungsprofil.
                </span>
              </td>
              <td className="px-4 py-3 align-top">
                <select
                  name="vis_cv"
                  value={settings.cv}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      cv: e.target.value as CvShareMode,
                    }))
                  }
                  className="gj-input text-sm"
                >
                  <option value="IMMEDIATE">Sofort nach Match</option>
                  <option value="ON_REQUEST">Nur nach meiner Freigabe</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[var(--gj-muted)]">
        <strong>Sofort sichtbar:</strong> im Kandidatenprofil ohne weitere Freigabe.{" "}
        <strong>Auf Anfrage:</strong> erst nach angenommenem Match (Lebenslauf zusätzlich per
        Freigabe-Klick). <strong>Nicht anzeigen:</strong> für Arbeitgeber unsichtbar.
      </p>

      <button type="submit" disabled={busy} className="gj-btn-primary">
        {busy ? "Speichern…" : "Sichtbarkeit speichern"}
      </button>
      {status ? (
        <p className="text-sm text-[var(--gj-muted)]" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
