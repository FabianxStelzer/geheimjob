"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatIcon, ClockIcon, EuroIcon, MapPinIcon } from "@/components/icons";
import { CvDraftPreview } from "@/components/cv-draft-preview";
import { ApplicationProfileDisplay } from "@/components/application-profile-display";
import type { PublicTalentProfile } from "@/lib/anonymous-profile";
import type { CandidateCardData } from "@/components/candidate-card";

export type ContactResult = { ok: boolean; matchId?: string };

export function CandidateProfilePanel({
  slug,
  cardPreview,
  onContact,
}: {
  slug: string;
  cardPreview?: CandidateCardData;
  onContact?: () => Promise<ContactResult>;
}) {
  const [profile, setProfile] = useState<PublicTalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactBusy, setContactBusy] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [cvBusy, setCvBusy] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workers/anonymous-profile/${encodeURIComponent(slug)}`);
      const data = (await res.json()) as {
        profile?: PublicTalentProfile;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Profil konnte nicht geladen werden.");
      const next = data.profile ?? null;
      setProfile(next);
      if (next?.employerMatch) setContactSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleContact() {
    if (!onContact || contactSent) return;
    setContactBusy(true);
    const result = await onContact();
    setContactBusy(false);
    if (result.ok) {
      setContactSent(true);
      await loadProfile();
    }
  }

  async function handleCvRequest() {
    if (!profile?.hasCv || profile.cvShareMode !== "ON_REQUEST") return;

    let matchId = profile.employerMatch?.id;
    if (!matchId && onContact && !contactSent) {
      setCvBusy(true);
      const result = await onContact();
      setCvBusy(false);
      if (!result.ok) return;
      setContactSent(true);
      matchId = result.matchId;
      await loadProfile();
      if (!matchId) {
        const res = await fetch(`/api/workers/anonymous-profile/${encodeURIComponent(slug)}`);
        const data = (await res.json()) as { profile?: PublicTalentProfile };
        matchId = data.profile?.employerMatch?.id;
        if (data.profile) setProfile(data.profile);
      }
    }

    if (!matchId) {
      alert("Bitte zuerst Kontakt aufnehmen.");
      return;
    }

    const cvAccess = profile.employerMatch?.cvAccess;
    if (cvAccess?.canView || cvAccess?.requested) return;

    setCvBusy(true);
    const res = await fetch(`/api/matches/${matchId}/cv-request`, { method: "POST" });
    setCvBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      alert(j.error || "Anfrage fehlgeschlagen.");
      return;
    }
    await loadProfile();
  }

  if (loading) {
    return <p className="text-sm text-[var(--gj-muted)]">Profil wird geladen…</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-700">{error}</p>;
  }

  if (!profile) return null;

  const cvAccess = profile.employerMatch?.cvAccess;
  const showCvPreview = profile.hasCv && profile.cvDraftJson;
  const showCvRequestButton =
    profile.hasCv && profile.cvShareMode === "ON_REQUEST" && !cvAccess?.canView;
  const cvRequested = cvAccess?.requested ?? false;
  const displayName = profile.displayName || cardPreview?.displayName || "Kandidat";

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <span className="gj-chip gj-chip-solid text-[10px] uppercase">Talentpool</span>
        {profile.employmentKind ? (
          <span className="gj-chip gj-chip-neutral text-[10px]">{profile.employmentKind}</span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[var(--gj-border)] bg-[var(--gj-bg)]/60 p-5">
        {profile.photoUrls.length > 1 ? (
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {profile.photoUrls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className={`aspect-square w-full rounded-xl object-cover ring-2 ring-white shadow-sm ${
                  i === 0 ? "col-span-2 row-span-2 sm:col-span-1 sm:row-span-1" : ""
                }`}
              />
            ))}
          </div>
        ) : (
          <ProfileAvatar photoUrl={profile.photoUrls[0] ?? null} label={displayName} size="large" />
        )}

        <div className="mt-4 text-center sm:text-left">
          <h3 className="text-xl font-semibold text-[var(--gj-text)]">{displayName}</h3>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">
            {profile.professionField}
            {profile.application.headline ? ` · ${profile.application.headline}` : ""}
          </p>
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
          <span className="gj-chip">
            <EuroIcon /> {profile.salaryExpectation.toLocaleString("de-DE")} €
          </span>
        ) : null}
      </div>

      <ApplicationProfileDisplay profile={profile} />

      {profile.hasCv && !showCvPreview ? (
        <section className="rounded-xl border border-dashed border-[var(--gj-border)] bg-white p-4 text-sm text-[var(--gj-muted)]">
          <p className="font-medium text-[var(--gj-text)]">Lebenslauf geschützt</p>
          <p className="mt-1">
            {profile.cvShareMode === "IMMEDIATE"
              ? "Lebenslauf ist hinterlegt, aber noch nicht als Vorschau verfügbar."
              : "Der vollständige Lebenslauf wird erst nach Freigabe durch den Kandidaten angezeigt."}
          </p>
        </section>
      ) : null}

      {showCvPreview ? (
        <section className="space-y-3 border-t border-[var(--gj-border)] pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--gj-muted)]">
            Lebenslauf
          </h4>
          <CvDraftPreview
            draftJson={profile.cvDraftJson!}
            meta={{
              displayName,
              professionField: profile.professionField,
              region: profile.region,
            }}
          />
        </section>
      ) : null}

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
          {showCvRequestButton ? (
            <button
              type="button"
              disabled={cvBusy || cvRequested}
              onClick={() => void handleCvRequest()}
              className="gj-btn-secondary"
            >
              {cvRequested ? "Lebenslauf angefordert" : cvBusy ? "Sende…" : "Lebenslauf anfordern"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ProfileAvatar({
  photoUrl,
  label,
  size = "large",
}: {
  photoUrl: string | null;
  label: string;
  size?: "large" | "default";
}) {
  const initials = label.slice(0, 2).toUpperCase();
  const large = size === "large";
  const imgClass = large
    ? "mx-auto aspect-square w-full max-w-[220px] rounded-2xl object-cover ring-4 ring-[var(--gj-primary-soft)] shadow-md"
    : "h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-[var(--gj-primary-soft)]";
  const fallbackClass = large
    ? "mx-auto flex aspect-square w-full max-w-[220px] items-center justify-center rounded-2xl bg-[var(--gj-primary-soft)] text-3xl font-bold text-[var(--gj-primary)] ring-4 ring-[var(--gj-primary-soft)]"
    : "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--gj-primary-soft)] text-sm font-bold text-[var(--gj-primary)]";

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt="" className={imgClass} />
    );
  }
  return <span className={fallbackClass}>{initials || "?"}</span>;
}
