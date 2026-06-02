"use client";

export function CvUploadField() {
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/cv", { method: "POST", body: fd });
    if (!res.ok) alert("Upload fehlgeschlagen (nur PDF, max. 5 MB).");
    else alert("Lebenslauf gespeichert. Für Arbeitgeber erst nach Match.");
    e.target.value = "";
  }

  return (
    <label className="block">
      <span className="gj-label">PDF-Lebenslauf (max. 5 MB)</span>
      <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">
        Für Arbeitgeber nach angenommenem Match — getrennt vom Lebenslauf-Editor oben.
      </span>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => void onChange(e)}
        className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--gj-primary-soft)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--gj-primary)] hover:file:bg-[var(--gj-primary-softer)]"
      />
    </label>
  );
}
