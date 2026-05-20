export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-16 text-zinc-900">
      <h1 className="text-3xl font-semibold">Datenschutzerklärung (Entwurf)</h1>
      <p className="mt-4 text-sm text-amber-800">
        Dies ist eine technische Vorlage für die Entwicklung. Vor Produktivgang ist eine
        rechtskonforme Ausarbeitung mit juristischer Prüfung erforderlich.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Verantwortliche Stelle</h2>
      <p>[Firma, Adresse, Kontakt]</p>
      <h2 className="mt-8 text-xl font-semibold">Zwecke der Verarbeitung</h2>
      <ul className="list-disc pl-6 text-sm leading-relaxed">
        <li>Bereitstellung der Plattform (Art. 6 Abs. 1 lit. b DSGVO)</li>
        <li>Nutzerkonto und Matching-Kommunikation</li>
        <li>Optional Abrechnung über Stripe als Auftragsverarbeiter</li>
      </ul>
      <h2 className="mt-8 text-xl font-semibold">Speicherdauer</h2>
      <p className="text-sm leading-relaxed">
        Daten werden gelöscht, sobald der Zweck entfällt oder Sie die Löschung über die
        Kontofunktion auslösen. Soft-Delete kann zur Missbrauchsbekämpfung vorübergehend
        Metadaten behalten — bitte produktiv konkretisieren.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Ihre Rechte</h2>
      <p className="text-sm leading-relaxed">
        Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit,
        Widerspruch — Kontaktieren Sie uns unter [E-Mail].
      </p>
      <h2 className="mt-8 text-xl font-semibold">Hosting & Logs</h2>
      <p className="text-sm leading-relaxed">
        Server-Logfiles können IP-Adressen enthalten; Aufbewahrungsfristen und CDN bitte
        gesondert dokumentieren.
      </p>
    </main>
  );
}
