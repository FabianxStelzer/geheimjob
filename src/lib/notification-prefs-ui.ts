import type { UserNotificationPrefs } from "@prisma/client";
import {
  EMAIL_NOTIFICATION_LABELS,
  WORKER_WHATSAPP_EVENTS,
  WHATSAPP_PREF_FIELD,
  type EmailNotificationEvent,
} from "@/lib/email-notification-events";

export type NotificationPrefsUi = Record<EmailNotificationEvent, boolean>;

export type WhatsAppPrefsUi = {
  enabled: boolean;
  events: Record<EmailNotificationEvent, boolean>;
};

export function prefsToUi(prefs: UserNotificationPrefs): NotificationPrefsUi {
  const keys = Object.keys(EMAIL_NOTIFICATION_LABELS) as EmailNotificationEvent[];
  const ui = {} as NotificationPrefsUi;
  for (const key of keys) {
    const field =
      key === "matchRequest"
        ? prefs.emailMatchRequest
        : key === "matchAccepted"
          ? prefs.emailMatchAccepted
          : key === "matchRejected"
            ? prefs.emailMatchRejected
            : key === "cvRequest"
              ? prefs.emailCvRequest
              : key === "cvGranted"
                ? prefs.emailCvGranted
                : key === "newMessage"
                  ? prefs.emailNewMessage
                  : key === "hiringStage"
                    ? prefs.emailHiringStage
                    : key === "newJobMatch"
                      ? prefs.emailNewJobMatch
                      : key === "newTalent"
                        ? prefs.emailNewTalent
                        : prefs.emailBilling;
    ui[key] = field;
  }
  return ui;
}

export function whatsappPrefsToUi(prefs: UserNotificationPrefs): WhatsAppPrefsUi {
  const events = {} as Record<EmailNotificationEvent, boolean>;
  for (const key of WORKER_WHATSAPP_EVENTS) {
    const field = WHATSAPP_PREF_FIELD[key];
    events[key] = field ? Boolean(prefs[field as keyof UserNotificationPrefs]) : false;
  }
  return { enabled: prefs.whatsappEnabled, events };
}
