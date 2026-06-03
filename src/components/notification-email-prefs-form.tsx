"use client";

import {
  EMAIL_NOTIFICATION_LABELS,
  type EmailNotificationEvent,
} from "@/lib/email-notification-events";
import { updateNotificationEmailPrefs } from "@/app/actions/notification-preferences";

const WORKER_EVENTS: EmailNotificationEvent[] = [
  "matchRequest",
  "matchAccepted",
  "matchRejected",
  "cvRequest",
  "cvGranted",
  "newMessage",
  "hiringStage",
  "newJobMatch",
  "billing",
];

const EMPLOYER_EVENTS: EmailNotificationEvent[] = [
  "matchRequest",
  "matchAccepted",
  "matchRejected",
  "cvRequest",
  "cvGranted",
  "newMessage",
  "newTalent",
  "billing",
];

const ADMIN_EVENTS: EmailNotificationEvent[] = ["billing"];

type PrefsRecord = Record<EmailNotificationEvent, boolean>;

export function NotificationEmailPrefsForm({
  role,
  prefs,
  smtpConfigured,
}: {
  role: "WORKER" | "EMPLOYER" | "ADMIN";
  prefs: PrefsRecord;
  smtpConfigured: boolean;
}) {
  const events =
    role === "WORKER"
      ? WORKER_EVENTS
      : role === "EMPLOYER"
        ? EMPLOYER_EVENTS
        : ADMIN_EVENTS;

  return (
    <form action={updateNotificationEmailPrefs} className="space-y-4">
      {!smtpConfigured ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          E-Mail-Versand ist auf dem Server noch nicht konfiguriert (SMTP). Ihre Einstellungen werden
          gespeichert und greifen, sobald der Versand aktiv ist.
        </p>
      ) : null}
      <ul className="divide-y divide-[var(--gj-border)] rounded-lg border border-[var(--gj-border)]">
        {events.map((key) => {
          const meta = EMAIL_NOTIFICATION_LABELS[key];
          return (
            <li key={key} className="flex items-start gap-4 px-4 py-4">
              <input
                type="checkbox"
                name={`pref_${key}`}
                id={`pref_${key}`}
                defaultChecked={prefs[key]}
                className="mt-1 h-4 w-4 rounded border-[var(--gj-border)]"
              />
              <label htmlFor={`pref_${key}`} className="min-w-0 flex-1 cursor-pointer">
                <span className="block text-sm font-medium text-[var(--gj-text)]">{meta.title}</span>
                <span className="mt-0.5 block text-xs text-[var(--gj-muted)]">{meta.description}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-[var(--gj-muted)]">
        In-App-Benachrichtigungen unter „Benachrichtigungen“ bleiben unverändert. Hier steuern Sie nur
        E-Mails.
      </p>
      <button type="submit" className="gj-btn-primary">
        E-Mail-Einstellungen speichern
      </button>
    </form>
  );
}
