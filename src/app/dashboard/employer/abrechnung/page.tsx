import { StripePayButtons } from "@/components/stripe-pay-buttons";
import { ReviewForm } from "@/components/review-form";

export default function EmployerBillingPage() {
  return (
    <div className="space-y-6">
      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Zahlung &amp; Abo</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Buchen Sie ein Monatsabo oder bezahlen Sie eine Vermittlungsprovision pro erfolgreichem Match.
        </p>
        <div className="mt-4">
          <StripePayButtons />
        </div>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Prozess bewerten</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Ihre Rückmeldung hilft neuen Kandidat:innen, Vertrauen aufzubauen.
        </p>
        <div className="mt-4">
          <ReviewForm />
        </div>
      </section>
    </div>
  );
}
