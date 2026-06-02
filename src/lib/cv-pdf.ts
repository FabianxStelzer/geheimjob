import PDFDocument from "pdfkit";
import type { CvDraft } from "@/lib/cv-draft";

export type CvPdfMeta = {
  displayName: string;
  professionField: string;
  region: string;
  experienceYears: number;
};

function period(from: string, to: string) {
  const a = from.trim();
  const b = to.trim();
  if (!a && !b) return "";
  if (!b || b.toLowerCase() === "heute") return a ? `${a} – heute` : "heute";
  if (!a) return b;
  return `${a} – ${b}`;
}

export function generateCvPdfBuffer(draft: CvDraft, meta: CvPdfMeta): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const primary = "#0f766e";

    doc.fontSize(22).fillColor(primary).text(meta.displayName || "Bewerberprofil");
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#444");
    const sub = [
      meta.professionField,
      meta.region,
      meta.experienceYears > 0 ? `${meta.experienceYears} Jahre Berufserfahrung` : null,
      draft.headline.trim() || null,
    ]
      .filter(Boolean)
      .join(" · ");
    if (sub) doc.text(sub);

    if (draft.summary.trim()) {
      doc.moveDown(1);
      sectionTitle(doc, "Profil", primary);
      doc.fontSize(10).fillColor("#222").text(draft.summary.trim(), { lineGap: 3 });
    }

    if (draft.experiences.some((e) => e.company || e.role)) {
      doc.moveDown(1);
      sectionTitle(doc, "Berufserfahrung", primary);
      for (const e of draft.experiences) {
        if (!e.company && !e.role) continue;
        doc.moveDown(0.4);
        doc.fontSize(11).fillColor("#111").text([e.role, e.company].filter(Boolean).join(" · "));
        const metaLine = [period(e.from, e.to), e.location].filter(Boolean).join(" · ");
        if (metaLine) doc.fontSize(9).fillColor("#666").text(metaLine);
        if (e.description.trim()) {
          doc.moveDown(0.2);
          doc.fontSize(9).fillColor("#333").text(e.description.trim(), { lineGap: 2 });
        }
      }
    }

    if (draft.education.some((e) => e.institution || e.degree)) {
      doc.moveDown(1);
      sectionTitle(doc, "Ausbildung", primary);
      for (const e of draft.education) {
        if (!e.institution && !e.degree) continue;
        doc.moveDown(0.4);
        doc.fontSize(11).fillColor("#111").text([e.degree, e.institution].filter(Boolean).join(" · "));
        const metaLine = period(e.from, e.to);
        if (metaLine) doc.fontSize(9).fillColor("#666").text(metaLine);
        if (e.description.trim()) {
          doc.moveDown(0.2);
          doc.fontSize(9).fillColor("#333").text(e.description.trim(), { lineGap: 2 });
        }
      }
    }

    if (draft.skills.length) {
      doc.moveDown(1);
      sectionTitle(doc, "Kenntnisse", primary);
      doc.fontSize(10).fillColor("#222").text(draft.skills.join(" · "));
    }

    if (draft.languages.length) {
      doc.moveDown(0.8);
      sectionTitle(doc, "Sprachen", primary);
      doc.fontSize(10).fillColor("#222").text(draft.languages.join(" · "));
    }

    if (draft.certificates.length) {
      doc.moveDown(0.8);
      sectionTitle(doc, "Zertifikate", primary);
      doc.fontSize(10).fillColor("#222").text(draft.certificates.join("\n"), { lineGap: 2 });
    }

    doc.end();
  });
}

function sectionTitle(doc: InstanceType<typeof PDFDocument>, title: string, color: string) {
  doc.fontSize(12).fillColor(color).text(title);
  doc.moveDown(0.2);
  const y = doc.y;
  doc
    .strokeColor(color)
    .lineWidth(1)
    .moveTo(48, y)
    .lineTo(547, y)
    .stroke();
  doc.moveDown(0.5);
}
