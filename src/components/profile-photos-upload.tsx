"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProfilePhotoCropModal } from "@/components/profile-photo-crop-modal";
import { isLikelyImageFile, readFileAsObjectUrl } from "@/lib/crop-image";
import { resolveLegacyPhotoUrl } from "@/lib/profile-photo-storage";
import type { WorkerProfilePhoto } from "@/lib/worker-profile-photos";
import { MAX_PHOTOS } from "@/lib/worker-profile-photos";

export function ProfilePhotosUpload({
  initialPhotos,
}: {
  initialPhotos: WorkerProfilePhoto[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  useEffect(() => {
    return () => {
      if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  async function refresh() {
    router.refresh();
  }

  async function uploadBlob(blob: Blob) {
    const fd = new FormData();
    fd.append("file", new File([blob], "profile.jpg", { type: "image/jpeg" }));
    const res = await fetch("/api/upload/profile-photo", {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    });
    const data = (await res.json()) as {
      photos?: WorkerProfilePhoto[];
      error?: string;
    };
    if (!res.ok) {
      throw new Error(data.error || `Upload fehlgeschlagen (${res.status}).`);
    }
    if (data.photos) setPhotos(data.photos);
    return data;
  }

  async function startCropForFile(file: File) {
    setStatus(null);
    try {
      const src = await readFileAsObjectUrl(file);
      setCropSrc(src);
    } catch {
      setStatus("Datei konnte nicht gelesen werden.");
    }
  }

  async function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) return;

    const files = [...list].filter(isLikelyImageFile);
    e.target.value = "";

    if (!files.length) {
      setStatus("Bitte ein Bild (JPEG, PNG, WebP oder HEIC) wählen.");
      return;
    }

    const slots = MAX_PHOTOS - photos.length;
    if (slots <= 0) {
      setStatus(`Maximal ${MAX_PHOTOS} Fotos.`);
      return;
    }

    const queue = files.slice(0, slots);
    setPendingFiles(queue.slice(1));
    await startCropForFile(queue[0]);
  }

  async function handleCropConfirm(blob: Blob) {
    setBusy(true);
    setStatus(null);
    try {
      await uploadBlob(blob);
      setStatus("Foto gespeichert.");
      await refresh();
      setCropSrc(null);
      if (pendingFiles.length > 0) {
        const [next, ...rest] = pendingFiles;
        setPendingFiles(rest);
        await startCropForFile(next);
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
      setCropSrc(null);
    } finally {
      setBusy(false);
    }
  }

  function closeCrop() {
    setCropSrc(null);
    setPendingFiles([]);
  }

  async function remove(photoId: string) {
    if (!confirm("Dieses Foto wirklich entfernen?")) return;
    setBusy(true);
    setStatus(null);
    const res = await fetch(`/api/upload/profile-photo?id=${encodeURIComponent(photoId)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const data = (await res.json()) as { photos?: WorkerProfilePhoto[]; error?: string };
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Löschen fehlgeschlagen.");
      return;
    }
    setPhotos(data.photos ?? []);
    setStatus("Foto entfernt.");
    await refresh();
  }

  async function setPrimary(photoId: string) {
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/upload/profile-photo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ photoId }),
    });
    const data = (await res.json()) as { photos?: WorkerProfilePhoto[]; error?: string };
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Aktion fehlgeschlagen.");
      return;
    }
    setPhotos(data.photos ?? []);
    await refresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--gj-muted)]">
        Bis zu {MAX_PHOTOS} Bilder. Nach Auswahl schneiden Sie jedes Foto quadratisch zu — das
        Hauptfoto erscheint in der Arbeitgeber-Suche.
      </p>

      {status ? (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            status.includes("gespeichert") || status.includes("entfernt")
              ? "bg-emerald-50 text-emerald-900"
              : "bg-rose-50 text-rose-800"
          }`}
          role="status"
        >
          {status}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p, idx) => (
            <li
              key={p.id}
              className={`relative overflow-hidden rounded-xl border ${
                idx === 0
                  ? "border-[var(--gj-primary)] ring-2 ring-[var(--gj-primary)]/30"
                  : "border-[var(--gj-border)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveLegacyPhotoUrl(p.url)}
                alt=""
                className="aspect-square w-full object-cover"
              />
              {idx === 0 ? (
                <span className="absolute left-2 top-2 rounded-md bg-[var(--gj-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                  Hauptfoto
                </span>
              ) : null}
              <div className="flex flex-wrap gap-1 border-t border-[var(--gj-border)] bg-white p-2">
                {idx !== 0 ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void setPrimary(p.id)}
                    className="flex-1 rounded-lg bg-[var(--gj-primary-soft)] px-2 py-1 text-[11px] font-medium text-[var(--gj-primary)]"
                  >
                    Als Hauptfoto
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(p.id)}
                  className="rounded-lg px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50"
                >
                  Löschen
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--gj-border)] px-4 py-8 text-center text-sm text-[var(--gj-muted)]">
          Noch keine Profilfotos. Klicken Sie auf „Foto hinzufügen“.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={busy || photos.length >= MAX_PHOTOS}
        onChange={(e) => void onFilePick(e)}
      />

      <button
        type="button"
        disabled={busy || photos.length >= MAX_PHOTOS}
        onClick={() => inputRef.current?.click()}
        className="gj-btn-primary"
      >
        {busy ? "Bitte warten…" : photos.length >= MAX_PHOTOS ? "Limit erreicht" : "Foto hinzufügen"}
      </button>

      {cropSrc ? (
        <ProfilePhotoCropModal
          imageSrc={cropSrc}
          onClose={closeCrop}
          onConfirm={handleCropConfirm}
        />
      ) : null}
    </div>
  );
}
