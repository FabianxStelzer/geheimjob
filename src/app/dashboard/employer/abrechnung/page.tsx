import { StripePayButtons } from "@/components/stripe-pay-buttons";
import { ReviewForm } from "@/components/review-form";

export default function EmployerBillingPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold">Abrechnung & Vertrauen</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Stripe Checkout für Abo oder Einmal-Provision. Bewertungen helfen neuen Kandidaten.
        </p>
      </header>
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Stripe Checkout</h2>
        <StripePayButtons />
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Prozess bewerten</h2>
        <ReviewForm />
      </section>
    </div>
  );
}
