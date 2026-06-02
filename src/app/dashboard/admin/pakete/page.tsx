import { ADDON_CATALOG, PLAN_CATALOG } from "@/lib/billing-plans";

export default function AdminPaketePage() {
  return (
    <div className="space-y-6">
      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Hauptpakete</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Stripe Price-IDs in der Server-<code className="text-xs">.env</code> (STRIPE_PRICE_STARTER, …) hinterlegen.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PLAN_CATALOG.map((p) => (
            <div key={p.code} className="rounded-xl border border-[var(--gj-border)] p-4">
              <p className="font-bold text-[var(--gj-text)]">{p.name}</p>
              <p className="text-xl font-extrabold text-[var(--gj-primary)]">{p.priceEur}€/Mo.</p>
              <p className="mt-2 text-sm text-[var(--gj-muted)]">{p.description}</p>
              <p className="mt-2 text-xs text-[var(--gj-muted)]">Code: {p.code}</p>
              <p className="text-xs text-[var(--gj-muted)]">Stellen: {p.jobSlots}</p>
              <p className="text-xs font-mono text-[var(--gj-primary)]">{p.stripePriceEnv}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Add-ons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ADDON_CATALOG.map((a) => (
            <div key={a.code} className="rounded-xl border border-[var(--gj-border)] p-4">
              <p className="font-bold text-[var(--gj-text)]">{a.name}</p>
              <p className="text-lg font-bold text-[var(--gj-primary)]">{a.priceEur}€/Mo.</p>
              <p className="mt-2 text-sm text-[var(--gj-muted)]">{a.description}</p>
              <p className="mt-2 text-xs font-mono text-[var(--gj-primary)]">{a.stripePriceEnv}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
