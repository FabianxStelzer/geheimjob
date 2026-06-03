import type { UserNotificationPrefs } from "@prisma/client";
import {
  EMAIL_NOTIFICATION_LABELS,
  type EmailNotificationEvent,
} from "@/lib/email-notification-events";

export type NotificationPrefsUi = Record<EmailNotificationEvent, boolean>;

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
