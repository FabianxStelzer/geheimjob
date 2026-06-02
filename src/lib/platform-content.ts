import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SupportSettings = {
  email: string | null;
  phone: string | null;
  intro: string | null;
};

export type LegalContent = {
  privacyHtml: string | null;
  termsHtml: string | null;
};

const DEFAULT_PRIVACY = `<p class="text-sm text-amber-800">Diese Datenschutzerklärung wird vom Betreiber im Super-Admin gepflegt.</p>
<h2 class="mt-8 text-[22px] font-bold text-[var(--gj-text)]">Verantwortliche Stelle</h2>
<p>[Bitte im Super-Admin ergänzen]</p>
<h2 class="mt-8 text-[22px] font-bold text-[var(--gj-text)]">Zwecke der Verarbeitung</h2>
<ul class="list-disc pl-6 text-sm leading-relaxed">
<li>Bereitstellung der Plattform (Art. 6 Abs. 1 lit. b DSGVO)</li>
<li>Nutzerkonto und Matching-Kommunikation</li>
</ul>`;

const DEFAULT_TERMS = `<p class="text-sm text-amber-800">Die Nutzungsbedingungen werden vom Betreiber im Super-Admin gepflegt.</p>
<p class="mt-6 text-sm leading-relaxed text-[var(--gj-text-secondary)]">Mit Registrierung erklären Sie sich einverstanden, die Plattform nur im Rahmen geltenden Rechts zu nutzen.</p>`;

async function loadRow() {
  let row = await prisma.platformSettings.findUnique({ where: { id: "default" } });
  if (!row) {
    row = await prisma.platformSettings.create({
      data: { id: "default", billingCatalogJson: "{}" },
    });
  }
  return row;
}

export const getSupportSettings = cache(async (): Promise<SupportSettings> => {
  const row = await loadRow();
  return {
    email: row.supportEmail?.trim() || null,
    phone: row.supportPhone?.trim() || null,
    intro: row.supportIntro?.trim() || null,
  };
});

export const getLegalContent = cache(async (): Promise<LegalContent> => {
  const row = await loadRow();
  return {
    privacyHtml: row.privacyContent?.trim() || null,
    termsHtml: row.termsContent?.trim() || null,
  };
});

export function privacyContentOrDefault(html: string | null) {
  return html || DEFAULT_PRIVACY;
}

export function termsContentOrDefault(html: string | null) {
  return html || DEFAULT_TERMS;
}
