"use client";

import { useMemo, useState } from "react";
import { saveWorkerCvDraft } from "@/app/actions/cv";
import {
  emptyCvDraft,
  joinLinesInput,
  newEducation,
  newExperience,
  parseCvDraft,
  splitLinesInput,
  type CvDraft,
  type CvEducation,
  type CvExperience,
} from "@/lib/cv-draft";

type Props = {
  initialJson: string | null;
  profileMeta: {
    displayName: string;
    professionField: string;
    region: string;
  };
};

export function CvBuilder({ initialJson, profileMeta }: Props) {
  const [draft, setDraft] = useState<CvDraft>(() => parseCvDraft(initialJson));
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const skillsText = useMemo(() => joinLinesInput(draft.skills), [draft.skills]);
  const languagesText = useMemo(() => joinLinesInput(draft.languages), [draft.languages]);
  const certificatesText = useMemo(() => joinLinesInput(draft.certificates), [draft.certificates]);

  function update(patch: Partial<CvDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function updateExperience(id: string, patch: Partial<CvExperience>) {
    setDraft((d) => ({
      ...d,
      experiences: d.experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  function updateEducation(id: string, patch: Partial<CvEducation>) {
    setDraft((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  async function handleSave() {
    setBusy(true);
    setStatus(null);
    const res = await saveWorkerCvDraft(JSON.stringify(draft));
    setBusy(false);
    if (!res.ok) {
      setStatus(res.error ?? "Speichern fehlgeschlagen.");
      return;
    }
    setStatus("Lebenslauf gespeichert.");
  }

  function resetForm() {
    if (!confirm("Alle Eingaben zurücksetzen?")) return;
    setDraft(emptyCvDraft());
    setStatus(null);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--gj-muted)]">
        Erstellen Sie Ihren Lebenslauf direkt hier. Die Daten bleiben in Ihrem Profil gespeichert.
        Optional können Sie unten eine PDF für Arbeitgeber hochladen (sichtbar erst nach Match).
      </p>

      <div className="inline-flex rounded-full border border-[var(--gj-border)] bg-white p-1">
        <button
          type="button"
          onClick={() => setTab("edit")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            tab === "edit" ? "bg-[var(--gj-primary)] text-white" : "text-[var(--gj-muted)]"
          }`}
        >
          Bearbeiten
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            tab === "preview" ? "bg-[var(--gj-primary)] text-white" : "text-[var(--gj-muted)]"
          }`}
        >
          Vorschau
        </button>
      </div>

      {status ? (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            status.includes("gespeichert")
              ? "bg-emerald-50 text-emerald-900"
              : "bg-rose-50 text-rose-800"
          }`}
          role="status"
        >
          {status}
        </p>
      ) : null}

      {tab === "preview" ? (
        <CvPreview draft={draft} meta={profileMeta} />
      ) : (
        <div className="space-y-6">
          <fieldset className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="gj-label">Berufsbezeichnung / Titel im Lebenslauf</span>
              <input
                className="gj-input"
                value={draft.headline}
                onChange={(e) => update({ headline: e.target.value })}
                placeholder="z. B. Senior Vertriebsmitarbeiter"
              />
            </label>
            <label className="md:col-span-2">
              <span className="gj-label">Kurzprofil / Zusammenfassung</span>
              <textarea
                className="gj-textarea"
                rows={4}
                value={draft.summary}
                onChange={(e) => update({ summary: e.target.value })}
                placeholder="2–4 Sätze zu Ihrer Erfahrung und Stärken…"
              />
            </label>
          </fieldset>

          <Section
            title="Berufserfahrung"
            onAdd={() =>
              update({ experiences: [...draft.experiences, newExperience()] })
            }
          >
            {draft.experiences.length === 0 ? (
              <EmptyHint text="Noch keine Station — „Eintrag hinzufügen“." />
            ) : (
              draft.experiences.map((exp, idx) => (
                <EntryCard
                  key={exp.id}
                  title={`Station ${idx + 1}`}
                  onRemove={() =>
                    update({ experiences: draft.experiences.filter((e) => e.id !== exp.id) })
                  }
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label>
                      <span className="gj-label">Position</span>
                      <input
                        className="gj-input"
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                      />
                    </label>
                    <label>
                      <span className="gj-label">Unternehmen</span>
                      <input
                        className="gj-input"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      />
                    </label>
                    <label>
                      <span className="gj-label">Ort</span>
                      <input
                        className="gj-input"
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label>
                        <span className="gj-label">Von</span>
                        <input
                          className="gj-input"
                          value={exp.from}
                          onChange={(e) => updateExperience(exp.id, { from: e.target.value })}
                          placeholder="01/2020"
                        />
                      </label>
                      <label>
                        <span className="gj-label">Bis</span>
                        <input
                          className="gj-input"
                          value={exp.to}
                          onChange={(e) => updateExperience(exp.id, { to: e.target.value })}
                          placeholder="heute"
                        />
                      </label>
                    </div>
                    <label className="md:col-span-2">
                      <span className="gj-label">Tätigkeiten</span>
                      <textarea
                        className="gj-textarea"
                        rows={3}
                        value={exp.description}
                        onChange={(e) =>
                          updateExperience(exp.id, { description: e.target.value })
                        }
                      />
                    </label>
                  </div>
                </EntryCard>
              ))
            )}
          </Section>

          <Section
            title="Ausbildung"
            onAdd={() => update({ education: [...draft.education, newEducation()] })}
          >
            {draft.education.length === 0 ? (
              <EmptyHint text="Noch keine Ausbildung eingetragen." />
            ) : (
              draft.education.map((edu, idx) => (
                <EntryCard
                  key={edu.id}
                  title={`Ausbildung ${idx + 1}`}
                  onRemove={() =>
                    update({ education: draft.education.filter((e) => e.id !== edu.id) })
                  }
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label>
                      <span className="gj-label">Abschluss / Bezeichnung</span>
                      <input
                        className="gj-input"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                      />
                    </label>
                    <label>
                      <span className="gj-label">Institution</span>
                      <input
                        className="gj-input"
                        value={edu.institution}
                        onChange={(e) =>
                          updateEducation(edu.id, { institution: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span className="gj-label">Von</span>
                      <input
                        className="gj-input"
                        value={edu.from}
                        onChange={(e) => updateEducation(edu.id, { from: e.target.value })}
                      />
                    </label>
                    <label>
                      <span className="gj-label">Bis</span>
                      <input
                        className="gj-input"
                        value={edu.to}
                        onChange={(e) => updateEducation(edu.id, { to: e.target.value })}
                      />
                    </label>
                    <label className="md:col-span-2">
                      <span className="gj-label">Details (optional)</span>
                      <textarea
                        className="gj-textarea"
                        rows={2}
                        value={edu.description}
                        onChange={(e) =>
                          updateEducation(edu.id, { description: e.target.value })
                        }
                      />
                    </label>
                  </div>
                </EntryCard>
              ))
            )}
          </Section>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="gj-label">Kenntnisse (je Zeile ein Eintrag)</span>
              <textarea
                className="gj-textarea font-mono text-xs"
                rows={4}
                value={skillsText}
                onChange={(e) => update({ skills: splitLinesInput(e.target.value) })}
                placeholder={"Vertrieb\nCRM\nVerhandlung"}
              />
            </label>
            <label>
              <span className="gj-label">Sprachen</span>
              <textarea
                className="gj-textarea font-mono text-xs"
                rows={4}
                value={languagesText}
                onChange={(e) => update({ languages: splitLinesInput(e.target.value) })}
                placeholder={"Deutsch (Muttersprache)\nEnglisch (fließend)"}
              />
            </label>
            <label className="md:col-span-2">
              <span className="gj-label">Zertifikate (optional, je Zeile)</span>
              <textarea
                className="gj-textarea font-mono text-xs"
                rows={3}
                value={certificatesText}
                onChange={(e) => update({ certificates: splitLinesInput(e.target.value) })}
              />
            </label>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-[var(--gj-border)] pt-4">
        <button type="button" className="gj-btn-primary" disabled={busy} onClick={() => void handleSave()}>
          {busy ? "Speichern…" : "Lebenslauf speichern"}
        </button>
        <button type="button" className="gj-btn-ghost" disabled={busy} onClick={resetForm}>
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  onAdd,
}: {
  title: string;
  children: React.ReactNode;
  onAdd: () => void;
}) {
  return (
    <section className="rounded-xl border border-[var(--gj-border)] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--gj-text)]">{title}</h3>
        <button type="button" onClick={onAdd} className="gj-btn-ghost text-xs">
          + Eintrag hinzufügen
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function EntryCard({
  title,
  children,
  onRemove,
}: {
  title: string;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg bg-[var(--gj-bg)] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--gj-muted)]">
          {title}
        </span>
        <button type="button" onClick={onRemove} className="text-xs text-rose-600 hover:underline">
          Entfernen
        </button>
      </div>
      {children}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-[var(--gj-muted)]">{text}</p>;
}

function CvPreview({
  draft,
  meta,
}: {
  draft: CvDraft;
  meta: { displayName: string; professionField: string; region: string };
}) {
  return (
    <article className="rounded-xl border border-[var(--gj-border)] bg-white p-6 shadow-sm">
      <header className="border-b border-[var(--gj-border)] pb-4">
        <h3 className="text-xl font-bold text-[var(--gj-primary)]">{meta.displayName}</h3>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          {[draft.headline || meta.professionField, meta.region].filter(Boolean).join(" · ")}
        </p>
      </header>

      {draft.summary ? (
        <section className="mt-4">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Profil</h4>
          <p className="mt-2 text-sm leading-relaxed text-[var(--gj-text)]">{draft.summary}</p>
        </section>
      ) : null}

      {draft.experiences.some((e) => e.company || e.role) ? (
        <section className="mt-5">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Berufserfahrung</h4>
          <ul className="mt-2 space-y-3">
            {draft.experiences
              .filter((e) => e.company || e.role)
              .map((e) => (
                <li key={e.id} className="text-sm">
                  <p className="font-semibold text-[var(--gj-text)]">
                    {[e.role, e.company].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-xs text-[var(--gj-muted)]">
                    {[e.from && `${e.from} – ${e.to || "heute"}`, e.location]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {e.description ? (
                    <p className="mt-1 text-[var(--gj-text-secondary)]">{e.description}</p>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {draft.education.some((e) => e.institution || e.degree) ? (
        <section className="mt-5">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Ausbildung</h4>
          <ul className="mt-2 space-y-3">
            {draft.education
              .filter((e) => e.institution || e.degree)
              .map((e) => (
                <li key={e.id} className="text-sm">
                  <p className="font-semibold text-[var(--gj-text)]">
                    {[e.degree, e.institution].filter(Boolean).join(" · ")}
                  </p>
                  {e.from || e.to ? (
                    <p className="text-xs text-[var(--gj-muted)]">
                      {e.from} – {e.to || "heute"}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {draft.skills.length ? (
        <section className="mt-5">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Kenntnisse</h4>
          <p className="mt-2 text-sm">{draft.skills.join(" · ")}</p>
        </section>
      ) : null}

      {draft.languages.length ? (
        <section className="mt-4">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Sprachen</h4>
          <p className="mt-2 text-sm">{draft.languages.join(" · ")}</p>
        </section>
      ) : null}

      {draft.certificates.length ? (
        <section className="mt-4">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Zertifikate</h4>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {draft.certificates.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
