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
    <label className="block text-sm">
      <span className="text-zinc-600">PDF-Lebenslauf</span>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => void onChange(e)}
        className="mt-1 block w-full text-sm"
      />
    </label>
  );
}
