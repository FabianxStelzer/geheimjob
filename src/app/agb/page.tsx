export default function AgbPage() {
  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:py-16">
      <p className="mb-8">
        <a href="/login" className="text-sm font-medium text-teal-700 hover:text-teal-900">
          ← Zur Anmeldung
        </a>
      </p>
      <h1 className="text-3xl font-semibold">Allgemeine Nutzungsbedingungen (Entwurf)</h1>
      <p className="mt-4 text-sm text-amber-800">
        Platzhalter für die Produktion — bitte juristisch ausarbeiten (Leistungsbeschreibung,
        Gebühren, Haftung, Verfügbarkeit, Vertragsstrafe bei Missbrauch etc.).
      </p>
      <p className="mt-6 text-sm leading-relaxed text-zinc-700">
        Mit Registrierung erklären Sie sich vorläufig einverstanden, die Plattform nur im Rahmen
        geltenden Rechts zu nutzen und wahrheitsgemäße Angaben zu machen.
      </p>
    </main>
  );
}
