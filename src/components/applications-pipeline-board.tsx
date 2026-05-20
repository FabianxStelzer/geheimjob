"use client";

import { useMemo, useState } from "react";
import { listPipelineBoardColumns, type PipelineBoardColumn } from "@/lib/application-pipeline";
import { SlideOver } from "@/components/slide-over";
import {
  PipelineDetailPanel,
  type PipelineDrawerPayload,
} from "@/components/pipeline-drawer";

export type PipelineCardVM = {
  id: string;
  column: PipelineBoardColumn;
  title: string;
  subtitle?: string;
  meta?: string;
  introPreview?: string | null;
  drawer: PipelineDrawerPayload;
};

export function ApplicationsPipelineBoard({ cards }: { cards: PipelineCardVM[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<PipelineDrawerPayload | null>(null);

  const grouped = useMemo(() => {
    const m = {} as Record<PipelineBoardColumn, PipelineCardVM[]>;
    for (const c of listPipelineBoardColumns()) {
      m[c.key] = [];
    }
    for (const card of cards) {
      m[card.column].push(card);
    }
    return m;
  }, [cards]);

  function openCard(d: PipelineDrawerPayload) {
    setActive(d);
    setOpen(true);
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 xl:grid xl:grid-cols-7 xl:overflow-visible xl:pb-0">
        {listPipelineBoardColumns().map((col) => {
          const items = grouped[col.key] || [];
          return (
            <section key={col.key} className="flex w-[280px] shrink-0 flex-col xl:w-auto">
              <header className="mb-2 flex items-center gap-2 px-1">
                <span className={`h-2.5 w-2.5 rounded-full ${col.accent}`} />
                <h2 className="text-xs font-semibold text-[var(--gj-text)] xl:text-sm">{col.label}</h2>
                <span className="text-xs text-[var(--gj-muted)]">{items.length}</span>
              </header>
              <div className="flex flex-1 flex-col gap-2 rounded-xl border border-dashed border-[var(--gj-border-strong)] bg-white/40 p-2 min-h-[140px] xl:min-h-[320px]">
                {items.length === 0 ? (
                  <p className="m-auto px-2 text-center text-[11px] text-[var(--gj-muted)]">—</p>
                ) : (
                  items.map((c) => (
                    <article key={c.id} className="gj-card rounded-xl border border-[var(--gj-primary)]/20 p-3 text-left shadow-sm transition hover:shadow-md">
                      <button
                        type="button"
                        onClick={() => openCard(c.drawer)}
                        className="block w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold leading-snug text-[var(--gj-text)]">
                            {c.title}
                          </h3>
                          <span className="shrink-0 rounded-md bg-[var(--gj-primary-softer)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--gj-primary)]">
                            Detail
                          </span>
                        </div>
                        {c.subtitle ? (
                          <p className="mt-1 line-clamp-2 text-xs text-[var(--gj-muted)]">{c.subtitle}</p>
                        ) : null}
                        {c.meta ? (
                          <p className="mt-2 text-[10px] text-[var(--gj-muted)]">{c.meta}</p>
                        ) : null}
                        {c.introPreview ? (
                          <p className="mt-2 line-clamp-2 text-[11px] italic text-[var(--gj-text)]/75">
                            “{c.introPreview}”
                          </p>
                        ) : null}
                      </button>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <SlideOver title={active?.viewerRole === "EMPLOYER" ? "Kandidatur" : "Bewerbung"} open={open} onClose={() => setOpen(false)}>
        {active ? <PipelineDetailPanel payload={active} /> : null}
      </SlideOver>
    </>
  );
}
