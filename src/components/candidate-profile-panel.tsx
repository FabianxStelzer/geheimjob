"use client";

import { useEffect, useState } from "react";
import { ChatIcon, ClockIcon, EuroIcon, MapPinIcon, UserIcon } from "@/components/icons";
import type { PublicAnonymousProfile } from "@/lib/anonymous-profile";
import type { CandidateCardData } from "@/components/candidate-card";

export function CandidateProfilePanel({
  slug,
  cardPreview,
  onContact,
}: {
  slug: string;
  cardPreview?: CandidateCardData;
  onContact?: () => Promise<boolean>;
}) {
  const [profile, setProfile] = useState<PublicAnonymousProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactBusy, setContactBusy] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
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
  }, [slug]);

  async function handleContact() {
    if (!onContact || contactSent) return;
    setContactBusy(true);
    const ok = await onContact();
    setContactBusy(false);
    if (ok) setContactSent(true);
  }

  if (loading) {
    return <p className="text-sm text-[var(--gj-muted)]">Profil wird geladen…</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-700">{error}</p>;
  }

  if (!profile) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <span className="gj-chip gj-chip-solid text-[10px] uppercase">Anonym</span>
        <span className="gj-chip gj-chip-neutral">Talentpool</span>
      </div>

      <div className="flex gap-4">
        <ProfileAvatar photoUrl={profile.photoUrl} label={profile.professionField} />
        <div>
          <h3 className="text-lg font-semibold text-[var(--gj-text)]">{profile.professionField}</h3>
          <p className="text-sm text-[var(--gj-muted)]">
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
          <span className="gj-chip">
            <EuroIcon /> {profile.salaryExpectation.toLocaleString("de-DE")} €
          </span>
        ) : null}
        {cardPreview ? (
          <span className="gj-chip gj-chip-neutral">{cardPreview.experienceYears} J. Erfahrung</span>
        ) : null}
      </div>

      {profile.bio ? (
        <section className="rounded-xl border border-[var(--gj-border-strong)] bg-[var(--gj-primary-softer)]/40 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--gj-text)]/90">
            {profile.bio}
          </p>
        </section>
      ) : (
        <p className="text-sm italic text-[var(--gj-muted)]">Kein Kurzprofil hinterlegt.</p>
      )}

      <p className="text-xs text-[var(--gj-muted)]">
        Name und Kontakt werden erst nach Match-Freigabe über die Plattform geteilt. Videos sind in
        dieser Ansicht ausgeblendet.
      </p>

      {onContact ? (
        <div className="flex flex-wrap gap-2 border-t border-[var(--gj-border)] pt-4">
          <button
            type="button"
            disabled={contactBusy || contactSent}
            onClick={() => void handleContact()}
            className="gj-btn-primary"
          >
            <ChatIcon />{" "}
            {contactSent ? "Anfrage gesendet" : contactBusy ? "Sende…" : "Kontakt aufnehmen"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ProfileAvatar({ photoUrl, label }: { photoUrl: string | null; label: string }) {
  const initials = label.slice(0, 2).toUpperCase();
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-[var(--gj-primary-soft)]"
      />
    );
  }
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--gj-primary-soft)] text-sm font-bold text-[var(--gj-primary)]">
      {initials || "?"}
    </span>
  );
}
