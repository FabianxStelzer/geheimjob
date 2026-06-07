import { saveWhatsAppPlatformSettings } from "@/app/actions/admin-platform";
import {
  getPlatformSettings,
  getTwilioAccountSid,
  getTwilioAuthToken,
  getTwilioWhatsAppFrom,
  maskSecret,
} from "@/lib/platform-settings";
import { twilioWhatsAppConfigured } from "@/lib/whatsapp-notifications";

export default async function AdminWhatsAppPage() {
  const [settings, configured, accountSid, authToken, from] = await Promise.all([
    getPlatformSettings(),
    twilioWhatsAppConfigured(),
    getTwilioAccountSid(),
    getTwilioAuthToken(),
    getTwilioWhatsAppFrom(),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">WhatsApp (Twilio)</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Zentrale Konfiguration für WhatsApp-Benachrichtigungen an Arbeitnehmer. Werte in der
          Datenbank haben Vorrang vor der Server-<code className="mx-1 text-xs">.env</code>.
        </p>
      </div>

      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          configured
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        {configured ? (
          <p>
            <strong>Aktiv.</strong> Arbeitnehmer mit aktiviertem WhatsApp erhalten Benachrichtigungen
            über Twilio.
          </p>
        ) : (
          <p>
            <strong>Nicht konfiguriert.</strong> Account SID, Auth Token und Absender-Nummer
            hinterlegen — oder in der <code className="text-xs">.env</code> setzen.
          </p>
        )}
      </div>

      <section className="gj-card p-6">
        <form action={saveWhatsAppPlatformSettings} className="grid gap-4">
          <label className="block">
            <span className="gj-label">Twilio Account SID</span>
            <input
              name="twilioAccountSid"
              type="password"
              autoComplete="off"
              className="gj-input font-mono text-sm"
              placeholder={
                settings.twilioAccountSid ? maskSecret(settings.twilioAccountSid) : "AC…"
              }
            />
            <label className="mt-1 flex items-center gap-2 text-xs text-[var(--gj-muted)]">
              <input type="checkbox" name="clearTwilioAccountSid" /> Gespeicherte SID löschen
            </label>
          </label>

          <label className="block">
            <span className="gj-label">Twilio Auth Token</span>
            <input
              name="twilioAuthToken"
              type="password"
              autoComplete="off"
              className="gj-input font-mono text-sm"
              placeholder={settings.twilioAuthToken ? maskSecret(settings.twilioAuthToken) : "••••••••"}
            />
            <label className="mt-1 flex items-center gap-2 text-xs text-[var(--gj-muted)]">
              <input type="checkbox" name="clearTwilioAuthToken" /> Gespeichertes Token löschen
            </label>
          </label>

          <label className="block">
            <span className="gj-label">WhatsApp-Absender (E.164)</span>
            <input
              name="twilioWhatsAppFrom"
              type="text"
              className="gj-input font-mono text-sm"
              placeholder={settings.twilioWhatsAppFrom ?? "+14155238886"}
              defaultValue={settings.twilioWhatsAppFrom ?? ""}
            />
            <p className="mt-1 text-xs text-[var(--gj-muted)]">
              Sandbox z. B. <code>+14155238886</code> — oder Ihre freigeschaltete Business-Nummer.
            </p>
            <label className="mt-2 flex items-center gap-2 text-xs text-[var(--gj-muted)]">
              <input type="checkbox" name="clearTwilioWhatsAppFrom" /> Gespeicherte Nummer löschen
            </label>
          </label>

          <button type="submit" className="gj-btn-primary w-fit">
            WhatsApp-Einstellungen speichern
          </button>
        </form>
      </section>

      <section className="gj-card p-6">
        <h3 className="text-sm font-semibold">Aktive Konfiguration (effektiv)</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4 border-b border-[var(--gj-border)] pb-2">
            <dt className="text-[var(--gj-muted)]">Account SID</dt>
            <dd className="font-mono text-xs">{accountSid ? maskSecret(accountSid) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--gj-border)] pb-2">
            <dt className="text-[var(--gj-muted)]">Auth Token</dt>
            <dd className="font-mono text-xs">{authToken ? maskSecret(authToken) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--gj-muted)]">Absender</dt>
            <dd className="font-mono text-xs">{from ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="gj-card p-6 text-sm text-[var(--gj-muted)]">
        <h3 className="font-semibold text-[var(--gj-text)]">Hinweise</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Arbeitnehmer aktivieren WhatsApp unter Einstellungen und hinterlegen ihre Nummer.</li>
          <li>Twilio-Sandbox: Empfängernummer muss einmalig per Sandbox-Code freigeschaltet werden.</li>
          <li>Leere Felder beim Speichern = bestehende Werte bleiben unverändert.</li>
        </ul>
      </section>
    </div>
  );
}
