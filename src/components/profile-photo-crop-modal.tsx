"use client";

import "react-easy-crop/react-easy-crop.css";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/crop-image";

type Props = {
  imageSrc: string;
  onClose: () => void;
  onConfirm: (blob: Blob) => Promise<void>;
};

export function ProfilePhotoCropModal({ imageSrc, onClose, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleSave() {
    if (!croppedAreaPixels) {
      setError("Bitte Bild positionieren und erneut versuchen.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, 800);
      if (blob.size > 2 * 1024 * 1024) {
        setError("Bild nach Zuschnitt zu groß. Bitte stärker heranzoomen.");
        setBusy(false);
        return;
      }
      await onConfirm(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Zuschnitt fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
    >
      <div className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="border-b border-[var(--gj-border)] px-5 py-4">
          <h2 id="crop-title" className="text-base font-semibold text-[var(--gj-text)]">
            Profilfoto zuschneiden
          </h2>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">
            Ziehen und zoomen — quadratischer Ausschnitt für die Suche.
          </p>
        </header>

        <div className="relative h-[min(60vh,420px)] w-full bg-[var(--gj-bg)]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-2 border-b border-[var(--gj-border)] px-5 py-4">
          <label className="flex items-center gap-3 text-sm text-[var(--gj-text-secondary)]">
            <span className="shrink-0 font-medium">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[var(--gj-primary)]"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 px-5 py-4">
          <button type="button" className="gj-btn-ghost" disabled={busy} onClick={onClose}>
            Abbrechen
          </button>
          <button type="button" className="gj-btn-primary" disabled={busy} onClick={() => void handleSave()}>
            {busy ? "Speichern…" : "Speichern & hochladen"}
          </button>
        </footer>
      </div>
    </div>
  );
}
