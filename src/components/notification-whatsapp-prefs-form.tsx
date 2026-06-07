"use client";

import {
  EMAIL_NOTIFICATION_LABELS,
  WORKER_WHATSAPP_EVENTS,
  type EmailNotificationEvent,
} from "@/lib/email-notification-events";
import type { WhatsAppPrefsUi } from "@/lib/notification-prefs-ui";
import { updateWhatsAppNotificationPrefs } from "@/app/actions/notification-preferences";

export function NotificationWhatsAppPrefsForm({
  prefs,
  whatsappPhone,
  twilioConfigured,
}: {
  prefs: WhatsAppPrefsUi;
  whatsappPhone: string;
  twilioConfigured: boolean;
}) {
  return (
    <form action={updateWhatsAppNotificationPrefs} className="space-y-4">
      {!twilioConfigured ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          WhatsApp-Versand ist auf dem Server noch nicht konfiguriert (Twilio). Ihre Einstellungen
          werden gespeichert und greifen, sobald Twilio aktiv ist.
        </p>
      ) : null}

      <label className="block">
        <span className="gj-label">WhatsApp-Nummer</span>
        <input
          name="whatsappPhone"
          type="tel"
          defaultValue={whatsappPhone}
          className="gj-input mt-1"
          placeholder="+49 170 1234567"
        />
        <span className="mt-1 block text-xs text-[var(--gj-muted)]">
          Mit Ländervorwahl, z. B. +49… — für Benachrichtigungen, nicht öffentlich im Profil.
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-[var(--gj-border)] bg-[var(--gj-primary-softer)]/30 px-4 py-4">
        <input
          type="checkbox"
          name="whatsappEnabled"
          defaultChecked={prefs.enabled}
          className="mt-1 h-4 w-4 rounded border-[var(--gj-border)]"
        />
        <span>
          <span className="block text-sm font-medium text-[var(--gj-text)]">
            WhatsApp-Benachrichtigungen aktivieren
          </span>
          <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">
            Sie erhalten Nachrichten nur bei den unten ausgewählten Aktionen.
          </span>
        </span>
      </label>

      <ul className="divide-y divide-[var(--gj-border)] rounded-lg border border-[var(--gj-border)]">
        {WORKER_WHATSAPP_EVENTS.map((key: EmailNotificationEvent) => {
          const meta = EMAIL_NOTIFICATION_LABELS[key];
          return (
            <li key={key} className="flex items-start gap-4 px-4 py-4">
              <input
                type="checkbox"
                name={`wa_pref_${key}`}
                id={`wa_pref_${key}`}
                defaultChecked={prefs.events[key]}
                className="mt-1 h-4 w-4 rounded border-[var(--gj-border)]"
              />
              <label htmlFor={`wa_pref_${key}`} className="min-w-0 flex-1 cursor-pointer">
                <span className="block text-sm font-medium text-[var(--gj-text)]">{meta.title}</span>
                <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">{meta.description}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-[var(--gj-muted)]">
        In-App- und E-Mail-Benachrichtigungen bleiben unabhängig. Für die Twilio-Sandbox muss Ihre
        Nummer einmalig beim Anbieter freigeschaltet werden.
      </p>

      <button type="submit" className="gj-btn-primary">
        WhatsApp-Einstellungen speichern
      </button>
    </form>
  );
}
