"use client";

export function StripePayButtons() {
  async function checkout(mode: "subscription" | "placement") {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    alert(data.error || "Checkout nicht möglich — Stripe-Keys / Price-IDs fehlen.");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={() => void checkout("subscription")} className="gj-btn-primary">
        Abo buchen (Stripe)
      </button>
      <button type="button" onClick={() => void checkout("placement")} className="gj-btn-ghost">
        Einmal-Provision (Match)
      </button>
    </div>
  );
}
