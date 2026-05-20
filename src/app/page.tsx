import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-16 px-4 py-16">
      <section className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
          Diskrete Jobsuche
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
          Der kontrollierte Marktplatz für Jobwechsler und Arbeitgeber.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
          Arbeitnehmer pflegen ein Profil und entscheiden, wer sie kontaktieren darf — erst nach
          gegenseitiger Match-Bestätigung werden Kontaktdaten und Unterlagen freigegeben.
          Arbeitgeber finden passende Kandidaten über Filter und anonyme Profil-Links.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/register/arbeitnehmer"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-zinc-800"
          >
            Als Arbeitnehmer starten
          </Link>
          <Link
            href="/register/arbeitgeber"
            className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Unternehmen registrieren
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Datenschutz & Kontrolle",
            body: "E-Mail-Login, Einwilligung, Löschfunktion, Ausschlussliste für aktuelle Arbeitgeber.",
          },
          {
            title: "Matches & Chat",
            body: "Bidirektionale Anfragen, Zustimmungspflicht, anschließend In-App-Chat — weniger E-Mail-Chaos.",
          },
          {
            title: "Monetarisierung",
            body: "Stripe-Hooks für Abo oder Vermittlungsprovision — im Demomodus ohne Keys dokumentiert.",
          },
        ].map((f) => (
          <article key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{f.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">{f.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
