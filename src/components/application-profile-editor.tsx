"use client";

import { useState } from "react";
import { saveApplicationProfile } from "@/app/actions/application-profile";
import { ApplicationProfileDisplay } from "@/components/application-profile-display";
import {
  emptyApplicationProfile,
  newEducation,
  newExperience,
  parseApplicationProfile,
  type ApplicationProfile,
} from "@/lib/application-profile";
import { joinLinesInput, splitLinesInput } from "@/lib/cv-draft";

export function ApplicationProfileEditor({
  initialJson,
  previewContext,
}: {
  initialJson: string | null;
  previewContext: {
    bio: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    socialLinkedin: string | null;
    socialXing: string | null;
    socialWebsite: string | null;
  };
}) {
  const [profile, setProfile] = useState<ApplicationProfile>(() =>
    parseApplicationProfile(initialJson),
  );
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [skillsText, setSkillsText] = useState(() =>
    joinLinesInput(parseApplicationProfile(initialJson).skills),
  );
  const [languagesText, setLanguagesText] = useState(() =>
    joinLinesInput(parseApplicationProfile(initialJson).languages),
  );
  const [certificatesText, setCertificatesText] = useState(() =>
    joinLinesInput(parseApplicationProfile(initialJson).certificates),
  );
  const [interestsText, setInterestsText] = useState(() =>
    joinLinesInput(parseApplicationProfile(initialJson).interests),
  );

  function update(patch: Partial<ApplicationProfile>) {
    setProfile((p) => ({ ...p, ...patch }));
  }

  async function handleSave() {
    setBusy(true);
    setStatus(null);
    const payload: ApplicationProfile = {
      ...profile,
      skills: splitLinesInput(skillsText),
      languages: splitLinesInput(languagesText),
      certificates: splitLinesInput(certificatesText),
      interests: splitLinesInput(interestsText),
    };
    const res = await saveApplicationProfile(JSON.stringify(payload));
    setBusy(false);
    if (!res.ok) {
      setStatus(res.error ?? "Speichern fehlgeschlagen.");
      return;
    }
    setProfile(payload);
    setStatus("Bewerbungsprofil gespeichert.");
  }

  return (
    <div className="space-y-4">
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
        <div className="rounded-xl border border-[var(--gj-border)] bg-[var(--gj-bg)]/60 p-5">
          <ApplicationProfileDisplay
            profile={{
              ...previewContext,
              application: {
                ...profile,
                skills: splitLinesInput(skillsText),
                languages: splitLinesInput(languagesText),
                certificates: splitLinesInput(certificatesText),
                interests: splitLinesInput(interestsText),
              },
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <label>
            <span className="gj-label">Berufsbezeichnung / Schwerpunkt</span>
            <input
              className="gj-input"
              value={profile.headline}
              onChange={(e) => update({ headline: e.target.value })}
              placeholder="z. B. Kundenberater im Außendienst"
            />
          </label>

          <EditorSection
            title="Werdegang"
            onAdd={() => update({ experiences: [...profile.experiences, newExperience()] })}
          >
            {profile.experiences.length === 0 ? (
              <p className="text-sm text-[var(--gj-muted)]">Noch keine Station eingetragen.</p>
            ) : (
              profile.experiences.map((exp, idx) => (
                <EditorEntry
                  key={exp.id}
                  title={`Station ${idx + 1}`}
                  onRemove={() =>
                    update({ experiences: profile.experiences.filter((e) => e.id !== exp.id) })
                  }
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label>
                      <span className="gj-label">Position</span>
                      <input
                        className="gj-input"
                        value={exp.role}
                        onChange={(e) =>
                          update({
                            experiences: profile.experiences.map((x) =>
                              x.id === exp.id ? { ...x, role: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="gj-label">Unternehmen</span>
                      <input
                        className="gj-input"
                        value={exp.company}
                        onChange={(e) =>
                          update({
                            experiences: profile.experiences.map((x) =>
                              x.id === exp.id ? { ...x, company: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="gj-label">Ort</span>
                      <input
                        className="gj-input"
                        value={exp.location}
                        onChange={(e) =>
                          update({
                            experiences: profile.experiences.map((x) =>
                              x.id === exp.id ? { ...x, location: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label>
                        <span className="gj-label">Von</span>
                        <input
                          className="gj-input"
                          value={exp.from}
                          onChange={(e) =>
                            update({
                              experiences: profile.experiences.map((x) =>
                                x.id === exp.id ? { ...x, from: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        <span className="gj-label">Bis</span>
                        <input
                          className="gj-input"
                          value={exp.to}
                          onChange={(e) =>
                            update({
                              experiences: profile.experiences.map((x) =>
                                x.id === exp.id ? { ...x, to: e.target.value } : x,
                              ),
                            })
                          }
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
                          update({
                            experiences: profile.experiences.map((x) =>
                              x.id === exp.id ? { ...x, description: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                </EditorEntry>
              ))
            )}
          </EditorSection>

          <EditorSection
            title="Ausbildung"
            onAdd={() => update({ education: [...profile.education, newEducation()] })}
          >
            {profile.education.length === 0 ? (
              <p className="text-sm text-[var(--gj-muted)]">Noch keine Ausbildung eingetragen.</p>
            ) : (
              profile.education.map((edu, idx) => (
                <EditorEntry
                  key={edu.id}
                  title={`Ausbildung ${idx + 1}`}
                  onRemove={() =>
                    update({ education: profile.education.filter((e) => e.id !== edu.id) })
                  }
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label>
                      <span className="gj-label">Abschluss</span>
                      <input
                        className="gj-input"
                        value={edu.degree}
                        onChange={(e) =>
                          update({
                            education: profile.education.map((x) =>
                              x.id === edu.id ? { ...x, degree: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="gj-label">Institution</span>
                      <input
                        className="gj-input"
                        value={edu.institution}
                        onChange={(e) =>
                          update({
                            education: profile.education.map((x) =>
                              x.id === edu.id ? { ...x, institution: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="gj-label">Von</span>
                      <input
                        className="gj-input"
                        value={edu.from}
                        onChange={(e) =>
                          update({
                            education: profile.education.map((x) =>
                              x.id === edu.id ? { ...x, from: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      <span className="gj-label">Bis</span>
                      <input
                        className="gj-input"
                        value={edu.to}
                        onChange={(e) =>
                          update({
                            education: profile.education.map((x) =>
                              x.id === edu.id ? { ...x, to: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                </EditorEntry>
              ))
            )}
          </EditorSection>

          <label>
            <span className="gj-label">Fähigkeiten (eine pro Zeile)</span>
            <textarea
              className="gj-textarea"
              rows={4}
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Vertrieb&#10;CRM&#10;Verhandlungsführung"
            />
          </label>
          <label>
            <span className="gj-label">Sprachen (eine pro Zeile)</span>
            <textarea
              className="gj-textarea"
              rows={3}
              value={languagesText}
              onChange={(e) => setLanguagesText(e.target.value)}
            />
          </label>
          <label>
            <span className="gj-label">Zertifikate (eine pro Zeile)</span>
            <textarea
              className="gj-textarea"
              rows={3}
              value={certificatesText}
              onChange={(e) => setCertificatesText(e.target.value)}
            />
          </label>
          <label>
            <span className="gj-label">Interessen (optional, eine pro Zeile)</span>
            <textarea
              className="gj-textarea"
              rows={3}
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
            />
          </label>

          <button type="button" disabled={busy} onClick={() => void handleSave()} className="gj-btn-primary">
            {busy ? "Speichern…" : "Bewerbungsprofil speichern"}
          </button>
        </div>
      )}
    </div>
  );
}

function EditorSection({
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
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" onClick={onAdd} className="gj-btn-ghost text-xs">
          + Eintrag hinzufügen
        </button>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function EditorEntry({
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
