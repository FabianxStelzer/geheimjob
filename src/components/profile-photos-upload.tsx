"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WorkerProfilePhoto } from "@/lib/worker-profile-photos";
import { MAX_PHOTOS } from "@/lib/worker-profile-photos";

export function ProfilePhotosUpload({
  initialPhotos,
}: {
  initialPhotos: WorkerProfilePhoto[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    router.refresh();
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setBusy(true);
    let current = [...photos];
    for (let i = 0; i < files.length; i++) {
      if (current.length >= MAX_PHOTOS) break;
      const fd = new FormData();
      fd.append("file", files[i]);
      const res = await fetch("/api/upload/profile-photo", { method: "POST", body: fd });
      const data = (await res.json()) as {
        photos?: WorkerProfilePhoto[];
        error?: string;
      };
      if (!res.ok) {
        alert(data.error || "Upload fehlgeschlagen.");
        break;
      }
      if (data.photos) current = data.photos;
    }
    setPhotos(current);
    setBusy(false);
    e.target.value = "";
    await refresh();
  }

  async function remove(photoId: string) {
    if (!confirm("Dieses Foto wirklich entfernen?")) return;
    setBusy(true);
    const res = await fetch(`/api/upload/profile-photo?id=${encodeURIComponent(photoId)}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { photos?: WorkerProfilePhoto[]; error?: string };
    setBusy(false);
    if (!res.ok) {
      alert(data.error || "Löschen fehlgeschlagen.");
      return;
    }
    setPhotos(data.photos ?? []);
    await refresh();
  }

  async function setPrimary(photoId: string) {
    setBusy(true);
    const res = await fetch("/api/upload/profile-photo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    });
    const data = (await res.json()) as { photos?: WorkerProfilePhoto[]; error?: string };
    setBusy(false);
    if (!res.ok) {
      alert(data.error || "Aktion fehlgeschlagen.");
      return;
    }
    setPhotos(data.photos ?? []);
    await refresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--gj-muted)]">
        Bis zu {MAX_PHOTOS} Bilder (JPEG, PNG, WebP, max. 3 MB). Das erste Foto erscheint in der
        Arbeitgeber-Suche und bei Bewerbungen.
      </p>

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
              <img src={p.url} alt="" className="aspect-square w-full object-cover" />
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
          Noch keine Profilfotos hochgeladen.
        </p>
      )}

      <label className="block">
        <span className="gj-label">
          {photos.length >= MAX_PHOTOS ? "Limit erreicht" : "Fotos hinzufügen"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || photos.length >= MAX_PHOTOS}
          onChange={(e) => void onUpload(e)}
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--gj-primary-soft)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--gj-primary)] hover:file:bg-[var(--gj-primary-softer)] disabled:opacity-50"
        />
      </label>
    </div>
  );
}
