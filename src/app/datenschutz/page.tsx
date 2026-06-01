import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[var(--gj-bg)]">
      <header className="border-b border-[var(--gj-border)] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <BrandLogo className="text-base min-w-[120px]" />
          <Link href="/login" className="text-sm font-medium text-[var(--gj-primary)] hover:text-[var(--gj-primary-hover)]">
            ← Zur Anmeldung
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:py-16 text-[var(--gj-text-secondary)]">
        <h1 className="text-[28px] font-bold text-[var(--gj-text)]">Datenschutzerklärung (Entwurf)</h1>
        <p className="mt-4 text-sm text-amber-800">
          Dies ist eine technische Vorlage für die Entwicklung. Vor Produktivgang ist eine rechtskonforme Ausarbeitung
          mit juristischer Prüfung erforderlich.
        </p>
        <h2 className="mt-8 text-[22px] font-bold text-[var(--gj-text)]">Verantwortliche Stelle</h2>
        <p>[Firma, Adresse, Kontakt]</p>
        <h2 className="mt-8 text-[22px] font-bold text-[var(--gj-text)]">Zwecke der Verarbeitung</h2>
        <ul className="list-disc pl-6 text-sm leading-relaxed">
          <li>Bereitstellung der Plattform (Art. 6 Abs. 1 lit. b DSGVO)</li>
          <li>Nutzerkonto und Matching-Kommunikation</li>
          <li>Optional Abrechnung über Stripe als Auftragsverarbeiter</li>
        </ul>
        <h2 className="mt-8 text-[22px] font-bold text-[var(--gj-text)]">Speicherdauer</h2>
        <p className="text-sm leading-relaxed">
          Daten werden gelöscht, sobald der Zweck entfällt oder Sie die Löschung über die Kontofunktion auslösen.
          Soft-Delete kann zur Missbrauchsbekämpfung vorübergehend Metadaten behalten — bitte produktiv konkretisieren.
        </p>
        <h2 className="mt-8 text-[22px] font-bold text-[var(--gj-text)]">Ihre Rechte</h2>
        <p className="text-sm leading-relaxed">
          Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch — Kontaktieren Sie uns unter
          [E-Mail].
        </p>
        <h2 className="mt-8 text-[22px] font-bold text-[var(--gj-text)]">Hosting & Logs</h2>
        <p className="text-sm leading-relaxed">
          Server-Logfiles können IP-Adressen enthalten; Aufbewahrungsfristen und CDN bitte gesondert dokumentieren.
        </p>
      </main>
    </div>
  );
}
