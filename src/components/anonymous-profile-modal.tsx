"use client";

import { useEffect, useState } from "react";
import { CloseIcon, ClockIcon, EuroIcon, MapPinIcon, UserIcon } from "@/components/icons";
import type { PublicAnonymousProfile } from "@/lib/anonymous-profile";

export function AnonymousProfileTrigger({
  slug,
  label = "Profil ansehen",
  className = "gj-btn-ghost",
}: {
  slug: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <AnonymousProfileModal slug={slug} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function AnonymousProfileModal({
  slug,
  open,
  onClose,
}: {
  slug: string;
  open: boolean;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<PublicAnonymousProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !slug) return;
    setLoading(true);
    setError(null);
    setProfile(null);
    void fetch(`/api/workers/anonymous-profile/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          profile?: PublicAnonymousProfile;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Profil konnte nicht geladen werden.");
        setProfile(data.profile ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler beim Laden."))
      .finally(() => setLoading(false));
  }, [open, slug]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anon-profile-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Schließen"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--gj-border)] bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-[var(--gj-border)] px-5 py-4">
          <div>
            <span className="gj-chip gj-chip-solid text-[10px] uppercase">Anonym</span>
            <h2 id="anon-profile-title" className="mt-2 text-lg font-semibold text-[var(--gj-text)]">
              Kandidatenprofil
            </h2>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--gj-muted)] hover:bg-[var(--gj-primary-softer)]"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <p className="text-sm text-[var(--gj-muted)]">Profil wird geladen…</p>
          ) : error ? (
            <p className="text-sm text-rose-700">{error}</p>
          ) : profile ? (
            <AnonymousProfileBody profile={profile} />
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-[var(--gj-border)] px-5 py-4">
          <button type="button" className="gj-btn-primary w-full sm:w-auto" onClick={onClose}>
            Schließen
          </button>
        </footer>
      </div>
    </div>
  );
}

function AnonymousProfileBody({ profile }: { profile: PublicAnonymousProfile }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--gj-primary-soft)] text-[var(--gj-primary)]">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--gj-text)]">{profile.professionField}</h3>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">
            {profile.region} · {profile.experienceYears} Jahre Erfahrung
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="gj-chip gj-chip-neutral">
          <MapPinIcon /> {profile.region}
        </span>
        <span className="gj-chip gj-chip-neutral">
          <ClockIcon /> {profile.availability}
        </span>
        {profile.salaryExpectation != null ? (
          <span className="gj-chip gj-chip-neutral">
            <EuroIcon /> {profile.salaryExpectation.toLocaleString("de-DE")} € / Monat
          </span>
        ) : null}
      </div>

      {profile.bio ? (
        <article className="rounded-xl border border-[var(--gj-border)] bg-[var(--gj-primary-soft)]/40 p-4 text-sm leading-relaxed text-[var(--gj-text-secondary)]">
          {profile.bio}
        </article>
      ) : (
        <p className="text-sm italic text-[var(--gj-muted)]">Kein Kurzprofil hinterlegt.</p>
      )}

      <p className="text-xs text-[var(--gj-muted)]">
        Name und Kontakt werden erst nach Match-Freigabe über die Plattform geteilt. Videos sind in
        dieser Ansicht ausgeblendet.
      </p>
    </div>
  );
}
