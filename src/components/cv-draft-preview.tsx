import { parseCvDraft, type CvDraft } from "@/lib/cv-draft";

export function CvDraftPreview({
  draftJson,
  meta,
}: {
  draftJson: string | null;
  meta: { displayName: string; professionField: string; region: string };
}) {
  const draft = parseCvDraft(draftJson);

  return (
    <article className="rounded-xl border border-[var(--gj-border)] bg-white p-5 text-sm">
      <header className="border-b border-[var(--gj-border)] pb-3">
        <h3 className="text-lg font-bold text-[var(--gj-primary)]">{meta.displayName}</h3>
        <p className="mt-1 text-[var(--gj-muted)]">
          {[draft.headline || meta.professionField, meta.region].filter(Boolean).join(" · ")}
        </p>
      </header>
      <CvDraftBody draft={draft} />
    </article>
  );
}

export function CvDraftBody({ draft }: { draft: CvDraft }) {
  return (
    <>
      {draft.summary ? (
        <section className="mt-4">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Profil</h4>
          <p className="mt-2 leading-relaxed text-[var(--gj-text)]">{draft.summary}</p>
        </section>
      ) : null}

      {draft.experiences.some((e) => e.company || e.role) ? (
        <section className="mt-5">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Berufserfahrung</h4>
          <ul className="mt-2 space-y-3">
            {draft.experiences
              .filter((e) => e.company || e.role)
              .map((e) => (
                <li key={e.id}>
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
                <li key={e.id}>
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
          <p className="mt-2">{draft.skills.join(" · ")}</p>
        </section>
      ) : null}

      {draft.languages.length ? (
        <section className="mt-4">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Sprachen</h4>
          <p className="mt-2">{draft.languages.join(" · ")}</p>
        </section>
      ) : null}

      {draft.certificates.length ? (
        <section className="mt-4">
          <h4 className="text-xs font-bold uppercase text-[var(--gj-primary)]">Zertifikate</h4>
          <ul className="mt-2 list-disc pl-5">
            {draft.certificates.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
