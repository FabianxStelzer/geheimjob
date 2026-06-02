"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listPipelineBoardColumns, type PipelineBoardColumn } from "@/lib/application-pipeline";
import { SlideOver } from "@/components/slide-over";
import {
  PipelineDetailPanel,
  type PipelineDrawerPayload,
} from "@/components/pipeline-drawer";

/** Feste Spaltenbreite für horizontales Scrollen (7 Pipeline-Stufen). */
const COLUMN_WIDTH_PX = 340;

export type PipelineCardVM = {
  id: string;
  column: PipelineBoardColumn;
  title: string;
  subtitle?: string;
  meta?: string;
  introPreview?: string | null;
  /** Profilbild Bewerber (Arbeitgeber) oder Firmenlogo (Arbeitnehmer). */
  avatarUrl?: string | null;
  avatarInitials?: string;
  drawer: PipelineDrawerPayload;
};

function PipelineCardAvatar({
  url,
  initials,
  rounded = "full",
}: {
  url?: string | null;
  initials: string;
  rounded?: "full" | "xl";
}) {
  const r = rounded === "xl" ? "rounded-xl" : "rounded-full";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`h-12 w-12 shrink-0 object-cover ring-2 ring-[var(--gj-primary-soft)] ${r}`}
      />
    );
  }
  return (
    <span
      className={`gj-gradient-primary flex h-12 w-12 shrink-0 items-center justify-center text-sm font-bold text-white ${r}`}
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function ApplicationsPipelineBoard({ cards }: { cards: PipelineCardVM[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<PipelineDrawerPayload | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  const updateScrollHints = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const left = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(left > 8);
    setCanScrollRight(left < max - 8);
  }, []);

  useEffect(() => {
    updateScrollHints();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateScrollHints());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollHints, cards]);

  const scrollByColumns = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction * (COLUMN_WIDTH_PX + 12);
    el.scrollBy({ left: amount, behavior: "smooth" });
    window.setTimeout(updateScrollHints, 350);
  }, [updateScrollHints]);

  function openCard(d: PipelineDrawerPayload) {
    setActive(d);
    setOpen(true);
  }

  const activeMatchId = active?.matchId;
  useEffect(() => {
    if (!activeMatchId) return;
    const card = cards.find((c) => c.drawer.matchId === activeMatchId);
    if (card) setActive(card.drawer);
  }, [cards, activeMatchId]);

  const columns = listPipelineBoardColumns();

  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-3">
        <span className="mr-auto text-xs text-[var(--gj-muted)]">
          Spalten nach links/rechts wischen oder mit den Pfeilen blättern
        </span>
        <button
          type="button"
          aria-label="Spalten nach links"
          disabled={!canScrollLeft}
          onClick={() => scrollByColumns(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--gj-border)] bg-white text-[var(--gj-text)] transition hover:bg-[var(--gj-primary-soft)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Spalten nach rechts"
          disabled={!canScrollRight}
          onClick={() => scrollByColumns(1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--gj-border)] bg-white text-[var(--gj-text)] transition hover:bg-[var(--gj-primary-soft)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          →
        </button>
      </div>

      <div className="relative -mx-1">
        <div
          ref={scrollRef}
          onScroll={updateScrollHints}
          className="flex gap-4 overflow-x-auto overscroll-x-contain pb-4 pt-1 scroll-smooth [scrollbar-width:thin] [scrollbar-color:var(--gj-primary)_var(--gj-border)]"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {columns.map((col) => {
            const items = grouped[col.key] || [];
            return (
              <section
                key={col.key}
                className="flex shrink-0 flex-col"
                style={{
                  width: COLUMN_WIDTH_PX,
                  scrollSnapAlign: "start",
                }}
              >
                <header className="mb-3 flex items-center gap-2 px-0.5">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${col.accent}`} />
                  <h2 className="min-w-0 flex-1 text-sm font-semibold leading-tight text-[var(--gj-text)]">
                    {col.label}
                  </h2>
                  <span className="shrink-0 rounded-full bg-[var(--gj-primary-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--gj-primary-hover)]">
                    {items.length}
                  </span>
                </header>
                <div className="flex min-h-[360px] flex-1 flex-col gap-3 rounded-xl border border-dashed border-[var(--gj-border-strong)] bg-white/60 p-3">
                  {items.length === 0 ? (
                    <p className="m-auto px-2 text-center text-xs text-[var(--gj-muted)]">—</p>
                  ) : (
                    items.map((c) => (
                      <article
                        key={c.id}
                        className="gj-card gj-card-interactive rounded-xl border border-[var(--gj-primary)]/20 p-0 text-left shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => openCard(c.drawer)}
                          className="block w-full p-4 text-left"
                        >
                          <div className="flex gap-3">
                            <PipelineCardAvatar
                              url={c.avatarUrl}
                              initials={c.avatarInitials ?? c.title.slice(0, 2)}
                              rounded={c.drawer.viewerRole === "WORKER" ? "xl" : "full"}
                            />
                            <div className="min-w-0 flex-1">
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
                            </div>
                          </div>
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <SlideOver
        title={active?.viewerRole === "EMPLOYER" ? "Kandidatur" : "Bewerbung"}
        open={open}
        onClose={() => setOpen(false)}
      >
        {active ? <PipelineDetailPanel payload={active} /> : null}
      </SlideOver>
    </>
  );
}
