import {
  saveAdminBootstrapEmail,
  saveBillingAutomationSettings,
  saveBillingCatalogSettings,
  saveLegalContent,
  saveSmtpFromSettings,
  saveStripePlatformSettings,
  saveSupportSettings,
  adminResetUserPassword,
} from "@/app/actions/admin-platform";
import { prisma } from "@/lib/prisma";
import { getBillingCatalog } from "@/lib/billing-catalog";
import { PLAN_CATALOG_DEFAULT, ADDON_CATALOG_DEFAULT } from "@/lib/billing-plans";
import {
  getAdminBootstrapEmail,
  getPlatformSettings,
  getSmtpFromEmail,
  maskSecret,
} from "@/lib/platform-settings";
import type { AddonCode } from "@/lib/billing-plans";
import type { EmployerPlan } from "@prisma/client";

export default async function AdminEinstellungenPage() {
  const [settings, catalog, bootstrapEmail, platformRow, smtpFromEmail] = await Promise.all([
    getPlatformSettings(),
    getBillingCatalog(),
    getAdminBootstrapEmail(),
    prisma.platformSettings.findUnique({ where: { id: "default" } }),
    getSmtpFromEmail(),
  ]);

  const planRows = PLAN_CATALOG_DEFAULT.map((base) => {
    const live = catalog.plans.find((p) => p.code === base.code);
    const o = settings.billingOverrides.plans?.[base.code as EmployerPlan];
    return { base, live: live ?? base, override: o };
  });

  const addonRows = ADDON_CATALOG_DEFAULT.map((base) => {
    const live = catalog.addons.find((a) => a.code === base.code);
    const o = settings.billingOverrides.addons?.[base.code as AddonCode];
    return { base, live: live ?? base, override: o };
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <p className="text-sm text-[var(--gj-muted)]">
        Zentrale Plattform-Konfiguration. Werte aus der Datenbank haben Vorrang vor der Server-
        <code className="mx-1 text-xs">.env</code>. Geheime Schlüssel leer lassen = unverändert lassen.
      </p>

      <section className="gj-card p-6">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">Stripe</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Secret Key, Webhook Secret und Publishable Key für Checkout (Karte / SEPA).
        </p>
        <form action={saveStripePlatformSettings} className="mt-6 grid gap-4">
          <label className="block">
            <span className="gj-label">Secret Key (sk_…)</span>
            <input
              name="stripeSecretKey"
              type="password"
              autoComplete="off"
              className="gj-input font-mono text-sm"
              placeholder={settings.stripeSecretKey ? maskSecret(settings.stripeSecretKey) : "sk_live_…"}
            />
            <label className="mt-1 flex items-center gap-2 text-xs text-[var(--gj-muted)]">
              <input type="checkbox" name="clearStripeSecret" /> Gespeicherten Key löschen
            </label>
          </label>
          <label className="block">
            <span className="gj-label">Webhook Secret (whsec_…)</span>
            <input
              name="stripeWebhookSecret"
              type="password"
              autoComplete="off"
              className="gj-input font-mono text-sm"
              placeholder={
                settings.stripeWebhookSecret ? maskSecret(settings.stripeWebhookSecret) : "whsec_…"
              }
            />
            <label className="mt-1 flex items-center gap-2 text-xs text-[var(--gj-muted)]">
              <input type="checkbox" name="clearStripeWebhook" /> Gespeicherten Webhook löschen
            </label>
          </label>
          <label className="block">
            <span className="gj-label">Publishable Key (pk_…)</span>
            <input
              name="stripePublishableKey"
              type="text"
              autoComplete="off"
              className="gj-input font-mono text-sm"
              placeholder={
                settings.stripePublishableKey
                  ? maskSecret(settings.stripePublishableKey)
                  : "pk_live_…"
              }
            />
            <label className="mt-1 flex items-center gap-2 text-xs text-[var(--gj-muted)]">
              <input type="checkbox" name="clearStripePublishable" /> Publishable Key löschen
            </label>
          </label>
          <p className="text-xs text-[var(--gj-muted)]">
            Webhook-URL: <code className="text-[var(--gj-primary)]">https://app.geheimjob.de/api/stripe/webhook</code>
          </p>
          <button type="submit" className="gj-btn-primary w-fit">
            Stripe speichern
          </button>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">E-Mail Versand</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Absender-Adresse für alle Plattform-E-Mails (Benachrichtigungen, Admin-Alerts). SMTP-Server
          (Host, Zugangsdaten) bleiben in der Server-<code className="text-xs">.env</code>.
        </p>
        <form action={saveSmtpFromSettings} className="mt-6 space-y-4">
          <label className="block">
            <span className="gj-label">Absender E-Mail</span>
            <input
              name="smtpFromEmail"
              type="email"
              defaultValue={platformRow?.smtpFromEmail ?? ""}
              className="gj-input"
              placeholder={process.env.SMTP_FROM || "noreply@geheimjob.de"}
            />
          </label>
          <p className="text-xs text-[var(--gj-muted)]">
            Aktuell aktiv:{" "}
            <code className="text-[var(--gj-primary)]">{smtpFromEmail ?? "— (SMTP nicht konfiguriert)"}</code>
            {platformRow?.smtpFromEmail
              ? " (aus Einstellungen)"
              : process.env.SMTP_FROM
                ? " (aus .env)"
                : null}
          </p>
          <button type="submit" className="gj-btn-primary w-fit">
            Absender speichern
          </button>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">Pakete &amp; Preise</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Monatspreise und Stripe Price-IDs (price_…) für Arbeitgeber-Abos.
        </p>
        <form action={saveBillingCatalogSettings} className="mt-6 space-y-8">
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--gj-muted)]">
              Hauptpakete
            </h3>
            {planRows.map(({ base, live, override }) => (
              <div
                key={base.code}
                className="rounded-xl border border-[var(--gj-border)] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--gj-text)]">{base.code}</span>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name={`plan_${base.code}_active`}
                      defaultChecked={override?.active !== false}
                    />
                    Aktiv
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="gj-label">Anzeigename</span>
                    <input
                      name={`plan_${base.code}_name`}
                      defaultValue={live.name}
                      className="gj-input"
                    />
                  </label>
                  <label className="block">
                    <span className="gj-label">Preis (€/Monat)</span>
                    <input
                      name={`plan_${base.code}_priceEur`}
                      type="number"
                      min={0}
                      defaultValue={live.priceEur}
                      className="gj-input"
                    />
                  </label>
                  <label className="block">
                    <span className="gj-label">Stellen-Slots</span>
                    <input
                      name={`plan_${base.code}_jobSlots`}
                      type="number"
                      min={0}
                      defaultValue={live.jobSlots}
                      className="gj-input"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="gj-label">Stripe Price-ID</span>
                    <input
                      name={`plan_${base.code}_stripePriceId`}
                      defaultValue={live.stripePriceId ?? ""}
                      className="gj-input font-mono text-sm"
                      placeholder={`Env: ${base.stripePriceEnv}`}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="gj-label">Kurzbeschreibung</span>
                    <input
                      name={`plan_${base.code}_description`}
                      defaultValue={live.description}
                      className="gj-input"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--gj-muted)]">
              Add-ons
            </h3>
            {addonRows.map(({ base, live, override }) => (
              <div
                key={base.code}
                className="rounded-xl border border-[var(--gj-border)] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--gj-text)]">{base.code}</span>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name={`addon_${base.code}_active`}
                      defaultChecked={override?.active !== false}
                    />
                    Aktiv
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="gj-label">Name</span>
                    <input name={`addon_${base.code}_name`} defaultValue={live.name} className="gj-input" />
                  </label>
                  <label className="block">
                    <span className="gj-label">Preis (€/Monat)</span>
                    <input
                      name={`addon_${base.code}_priceEur`}
                      type="number"
                      min={0}
                      defaultValue={live.priceEur}
                      className="gj-input"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="gj-label">Stripe Price-ID</span>
                    <input
                      name={`addon_${base.code}_stripePriceId`}
                      defaultValue={live.stripePriceId ?? ""}
                      className="gj-input font-mono text-sm"
                      placeholder={`Env: ${base.stripePriceEnv}`}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="gj-label">Beschreibung</span>
                    <input
                      name={`addon_${base.code}_description`}
                      defaultValue={live.description}
                      className="gj-input"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="gj-btn-primary">
            Pakete &amp; Preise speichern
          </button>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">Support-Center</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Kontaktdaten und Einleitungstext für das Support-Center in der Sidebar.
        </p>
        <form action={saveSupportSettings} className="mt-6 grid gap-4">
          <label className="block">
            <span className="gj-label">Support E-Mail</span>
            <input
              name="supportEmail"
              type="email"
              defaultValue={platformRow?.supportEmail ?? ""}
              className="gj-input"
              placeholder="info@geheimjob.de"
            />
          </label>
          <label className="block">
            <span className="gj-label">Support Telefon</span>
            <input
              name="supportPhone"
              type="tel"
              defaultValue={platformRow?.supportPhone ?? ""}
              className="gj-input"
              placeholder="+49 …"
            />
          </label>
          <label className="block">
            <span className="gj-label">Einleitungstext</span>
            <textarea
              name="supportIntro"
              rows={3}
              defaultValue={platformRow?.supportIntro ?? ""}
              className="gj-textarea"
              placeholder="Kurzer Hinweis über dem Kontaktformular…"
            />
          </label>
          <button type="submit" className="gj-btn-primary w-fit">
            Support speichern
          </button>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">Datenschutz &amp; AGB</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Inhalte für die öffentlichen Seiten /datenschutz und /agb. Einfaches HTML ist erlaubt
          (z. B. &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;).
        </p>
        <form action={saveLegalContent} className="mt-6 space-y-6">
          <label className="block">
            <span className="gj-label">Datenschutzerklärung (HTML)</span>
            <textarea
              name="privacyContent"
              rows={14}
              defaultValue={platformRow?.privacyContent ?? ""}
              className="gj-textarea font-mono text-xs"
            />
          </label>
          <label className="block">
            <span className="gj-label">Nutzungsbedingungen / AGB (HTML)</span>
            <textarea
              name="termsContent"
              rows={14}
              defaultValue={platformRow?.termsContent ?? ""}
              className="gj-textarea font-mono text-xs"
            />
          </label>
          <button type="submit" className="gj-btn-primary">
            Rechtstexte speichern
          </button>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">Automatisierung (n8n / Zapier)</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Optional: Webhook-URL, die bei jeder Paketbuchung (Rechnung oder Stripe) einen JSON-POST
          erhält — z. B. für Rechnungsstellung in n8n, Zapier oder Make.
        </p>
        <form action={saveBillingAutomationSettings} className="mt-4 space-y-3">
          <label className="block">
            <span className="gj-label">Webhook-URL</span>
            <input
              name="billingAutomationWebhookUrl"
              type="url"
              defaultValue={settings.billingOverrides.billingAutomationWebhookUrl ?? ""}
              className="gj-input font-mono text-sm"
              placeholder="https://hooks.zapier.com/… oder https://n8n.example.com/webhook/…"
            />
          </label>
          <p className="text-xs text-[var(--gj-muted)]">
            Payload: <code className="text-[var(--gj-primary)]">event: package.purchased</code> mit
            Unternehmen, Paket, Add-ons und Zahlungsart.
          </p>
          <button type="submit" className="gj-btn-secondary w-fit">
            Webhook speichern
          </button>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">Super-Admin Zugang</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Diese E-Mail erhält beim nächsten Login automatisch die Rolle ADMIN.
        </p>
        <form action={saveAdminBootstrapEmail} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block min-w-[280px] flex-1">
            <span className="gj-label">Bootstrap E-Mail</span>
            <input
              name="adminBootstrapEmail"
              type="email"
              defaultValue={bootstrapEmail ?? ""}
              className="gj-input"
              placeholder="info@geheimjob.de"
            />
          </label>
          <button type="submit" className="gj-btn-secondary">
            Speichern
          </button>
        </form>
      </section>

      <section className="gj-card p-6 border-amber-200 bg-amber-50/50">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">Nutzer-Passwort zurücksetzen</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Setzt ein neues Passwort für einen registrierten Nutzer (Arbeitnehmer oder Arbeitgeber).
        </p>
        <form action={adminResetUserPassword} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="gj-label">E-Mail des Nutzers</span>
            <input name="resetEmail" type="email" required className="gj-input" />
          </label>
          <label className="block">
            <span className="gj-label">Neues Passwort (min. 8 Zeichen)</span>
            <input name="newPassword" type="password" minLength={8} required className="gj-input" />
          </label>
          <button type="submit" className="gj-btn-danger sm:col-span-2 w-fit">
            Passwort setzen
          </button>
        </form>
      </section>

      <p className="text-xs text-[var(--gj-muted)]">
        Zuletzt geändert: {settings.updatedAt.toLocaleString("de-DE")}
      </p>
    </div>
  );
}
