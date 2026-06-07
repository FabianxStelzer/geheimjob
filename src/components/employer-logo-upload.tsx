"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ImageCropModal } from "@/components/image-crop-modal";
import { isLikelyImageFile, readFileAsObjectUrl } from "@/lib/crop-image";
import type { EmployerLogoVariant } from "@/lib/employer-logo-storage";

type Props = {
  logoUrl: string | null;
  logoSquareUrl: string | null;
  companyName: string;
};

export function EmployerLogoUpload({ logoUrl, logoSquareUrl, companyName }: Props) {
  const router = useRouter();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const squareInputRef = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState(logoUrl);
  const [square, setSquare] = useState(logoSquareUrl);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropVariant, setCropVariant] = useState<EmployerLogoVariant | null>(null);

  useEffect(() => {
    setBanner(logoUrl);
    setSquare(logoSquareUrl);
  }, [logoUrl, logoSquareUrl]);

  useEffect(() => {
    return () => {
      if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  async function uploadBlob(variant: EmployerLogoVariant, blob: Blob) {
    const fd = new FormData();
    fd.append("file", new File([blob], `${variant}.jpg`, { type: "image/jpeg" }));
    fd.append("variant", variant);
    const res = await fetch("/api/upload/employer-logo", {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) {
      throw new Error(data.error || `Upload fehlgeschlagen (${res.status}).`);
    }
    if (variant === "banner") setBanner(data.url ?? null);
    else setSquare(data.url ?? null);
    router.refresh();
  }

  async function removeLogo(variant: EmployerLogoVariant) {
    setBusy(true);
    setStatus(null);
    const res = await fetch(`/api/upload/employer-logo?variant=${variant}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setStatus(data.error || "Entfernen fehlgeschlagen.");
      return;
    }
    if (variant === "banner") setBanner(null);
    else setSquare(null);
    setStatus("Logo entfernt.");
    router.refresh();
  }

  async function onFilePick(variant: EmployerLogoVariant, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!isLikelyImageFile(file)) {
      setStatus("Bitte ein Bild (JPEG, PNG, WebP oder HEIC) wählen.");
      return;
    }
    setStatus(null);
    try {
      const src = await readFileAsObjectUrl(file);
      setCropVariant(variant);
      setCropSrc(src);
    } catch {
      setStatus("Datei konnte nicht gelesen werden.");
    }
  }

  async function handleCropConfirm(blob: Blob) {
    if (!cropVariant) return;
    setBusy(true);
    setStatus(null);
    try {
      await uploadBlob(cropVariant, blob);
      setStatus("Logo gespeichert.");
      setCropSrc(null);
      setCropVariant(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  const initial = companyName.slice(0, 2).toUpperCase();

  return (
    <div className="md:col-span-2 space-y-6">
      {cropSrc && cropVariant ? (
        <ImageCropModal
          imageSrc={cropSrc}
          title={cropVariant === "banner" ? "Firmenlogo zuschneiden" : "Profilbild zuschneiden"}
          description={
            cropVariant === "banner"
              ? "Freies Format für Ihre Unternehmensseite — Ziehen und zoomen."
              : "Quadratischer Ausschnitt für Stellenanzeigen und Listen."
          }
          aspect={cropVariant === "square" ? 1 : 3}
          onClose={() => {
            setCropSrc(null);
            setCropVariant(null);
          }}
          onConfirm={handleCropConfirm}
        />
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <LogoSlot
          label="Firmenlogo (Unternehmensseite)"
          hint="Freies Format, z. B. breites Logo mit Schriftzug."
          preview={
            banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner}
                alt=""
                className="max-h-20 max-w-full object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-[var(--gj-muted)]">{initial}</span>
            )
          }
          previewClass="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-[var(--gj-border)] bg-[var(--gj-bg)] px-4"
          busy={busy}
          hasLogo={Boolean(banner)}
          onPick={() => bannerInputRef.current?.click()}
          onRemove={() => void removeLogo("banner")}
        />
        <LogoSlot
          label="Profilbild (1:1)"
          hint="Quadratisch für Stellenanzeigen, Kandidatensuche und Matches."
          preview={
            square ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={square} alt="" className="h-20 w-20 rounded-xl object-cover" />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-[var(--gj-primary-soft)] text-lg font-bold text-[var(--gj-primary)]">
                {initial}
              </span>
            )
          }
          previewClass="flex items-center justify-center"
          busy={busy}
          hasLogo={Boolean(square)}
          onPick={() => squareInputRef.current?.click()}
          onRemove={() => void removeLogo("square")}
        />
      </div>

      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFilePick("banner", e)}
      />
      <input
        ref={squareInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFilePick("square", e)}
      />

      {status ? (
        <p className="text-sm text-[var(--gj-text-secondary)]" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}

function LogoSlot({
  label,
  hint,
  preview,
  previewClass,
  busy,
  hasLogo,
  onPick,
  onRemove,
}: {
  label: string;
  hint: string;
  preview: React.ReactNode;
  previewClass: string;
  busy: boolean;
  hasLogo: boolean;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--gj-border)] p-4">
      <p className="font-semibold text-[var(--gj-text)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--gj-muted)]">{hint}</p>
      <div className={`mt-4 ${previewClass}`}>{preview}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={onPick} className="gj-btn-secondary text-sm">
          {hasLogo ? "Ersetzen" : "Hochladen"}
        </button>
        {hasLogo ? (
          <button type="button" disabled={busy} onClick={onRemove} className="gj-btn-ghost text-sm text-red-700">
            Entfernen
          </button>
        ) : null}
      </div>
    </div>
  );
}
