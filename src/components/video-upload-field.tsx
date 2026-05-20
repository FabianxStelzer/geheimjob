"use client";

export function VideoUploadField() {
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/video", { method: "POST", body: fd });
    if (!res.ok) alert("Video-Upload fehlgeschlagen.");
    else alert("Video gespeichert.");
    e.target.value = "";
  }

  return (
    <label className="block">
      <span className="gj-label">Kurzvideo (MP4/WebM, ~30 Sek.)</span>
      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e) => void onChange(e)}
        className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--gj-primary-soft)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--gj-primary)] hover:file:bg-[var(--gj-primary-softer)]"
      />
    </label>
  );
}
