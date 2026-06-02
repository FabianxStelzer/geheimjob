import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { getLegalContent, privacyContentOrDefault } from "@/lib/platform-content";

export default async function DatenschutzPage() {
  const legal = await getLegalContent();
  const html = privacyContentOrDefault(legal.privacyHtml);

  return (
    <div className="min-h-screen bg-[var(--gj-bg)]">
      <header className="border-b border-[var(--gj-border)] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <BrandLogo className="text-base min-w-[120px]" />
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--gj-primary)] hover:text-[var(--gj-primary-hover)]"
          >
            ← Zur Anmeldung
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:py-16 text-[var(--gj-text-secondary)]">
        <h1 className="text-[28px] font-bold text-[var(--gj-text)]">Datenschutzerklärung</h1>
        <div
          className="legal-content mt-8 space-y-4 text-sm leading-relaxed [&_h2]:mt-8 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:text-[var(--gj-text)] [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}
