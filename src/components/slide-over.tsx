"use client";

import { CloseIcon } from "@/components/icons";

export function SlideOver({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
        aria-label="Schließen"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-[var(--gj-border)] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="slide-over-title"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[var(--gj-border)] px-5 py-4">
          <h2 id="slide-over-title" className="text-base font-semibold text-[var(--gj-text)]">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--gj-muted)] hover:bg-[var(--gj-primary-softer)] hover:text-[var(--gj-primary)]"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
