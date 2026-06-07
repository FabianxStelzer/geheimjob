import { NotificationKind } from "@prisma/client";

/** E-Mail-Ereignisse, unabhängig von In-App-NotificationKind (z. B. Hiring-Stage). */
export type EmailNotificationEvent =
  | "matchRequest"
  | "matchAccepted"
  | "matchRejected"
  | "cvRequest"
  | "cvGranted"
  | "newMessage"
  | "hiringStage"
  | "newJobMatch"
  | "newTalent"
  | "billing";

export const EMAIL_NOTIFICATION_LABELS: Record<
  EmailNotificationEvent,
  { title: string; description: string }
> = {
  matchRequest: {
    title: "Neue Bewerbung / Kontaktanfrage",
    description: "Jemand möchte Kontakt aufnehmen oder sich bewerben.",
  },
  matchAccepted: {
    title: "Anfrage angenommen",
    description: "Eine Kontaktanfrage wurde akzeptiert.",
  },
  matchRejected: {
    title: "Anfrage abgelehnt",
    description: "Eine Kontaktanfrage wurde abgelehnt.",
  },
  cvRequest: {
    title: "Lebenslauf angefragt",
    description: "Ein Arbeitgeber hat Ihren Lebenslauf angefordert.",
  },
  cvGranted: {
    title: "Lebenslauf freigegeben",
    description: "Ein Kandidat hat den Lebenslauf freigeschaltet.",
  },
  newMessage: {
    title: "Neue Chat-Nachricht",
    description: "Neue Nachricht in einem aktiven Gespräch.",
  },
  hiringStage: {
    title: "Bewerbungsstatus geändert",
    description: "Der Arbeitgeber hat den Stand Ihrer Bewerbung aktualisiert.",
  },
  newJobMatch: {
    title: "Neue passende Stellenanzeige",
    description: "Eine neue Stelle passt zu Ihrem Profil.",
  },
  newTalent: {
    title: "Neues Talent im Pool",
    description: "Ein neuer Kandidat ist für Premium-Arbeitgeber sichtbar.",
  },
  billing: {
    title: "Abrechnung & Pakete",
    description: "Hinweise zu Abonnement, Rechnung oder Zahlung.",
  },
};

/** Nur für Arbeitnehmer relevante WhatsApp-Ereignisse */
export const WORKER_WHATSAPP_EVENTS: EmailNotificationEvent[] = [
  "matchRequest",
  "matchAccepted",
  "matchRejected",
  "cvRequest",
  "newMessage",
  "hiringStage",
  "newJobMatch",
  "billing",
];

export const WHATSAPP_PREF_FIELD: Partial<
  Record<
    EmailNotificationEvent,
    | "whatsappMatchRequest"
    | "whatsappMatchAccepted"
    | "whatsappMatchRejected"
    | "whatsappCvRequest"
    | "whatsappCvGranted"
    | "whatsappNewMessage"
    | "whatsappHiringStage"
    | "whatsappNewJobMatch"
    | "whatsappBilling"
  >
> = {
  matchRequest: "whatsappMatchRequest",
  matchAccepted: "whatsappMatchAccepted",
  matchRejected: "whatsappMatchRejected",
  cvRequest: "whatsappCvRequest",
  cvGranted: "whatsappCvGranted",
  newMessage: "whatsappNewMessage",
  hiringStage: "whatsappHiringStage",
  newJobMatch: "whatsappNewJobMatch",
  billing: "whatsappBilling",
};

export const EMAIL_PREF_FIELD: Record<
  EmailNotificationEvent,
  | "emailMatchRequest"
  | "emailMatchAccepted"
  | "emailMatchRejected"
  | "emailCvRequest"
  | "emailCvGranted"
  | "emailNewMessage"
  | "emailHiringStage"
  | "emailNewJobMatch"
  | "emailNewTalent"
  | "emailBilling"
> = {
  matchRequest: "emailMatchRequest",
  matchAccepted: "emailMatchAccepted",
  matchRejected: "emailMatchRejected",
  cvRequest: "emailCvRequest",
  cvGranted: "emailCvGranted",
  newMessage: "emailNewMessage",
  hiringStage: "emailHiringStage",
  newJobMatch: "emailNewJobMatch",
  newTalent: "emailNewTalent",
  billing: "emailBilling",
};

export function emailEventForNotificationKind(
  kind: NotificationKind,
): EmailNotificationEvent | null {
  switch (kind) {
    case NotificationKind.MATCH_REQUEST:
      return "matchRequest";
    case NotificationKind.MATCH_ACCEPTED:
      return "matchAccepted";
    case NotificationKind.MATCH_REJECTED:
      return "matchRejected";
    case NotificationKind.CV_REQUEST:
      return "cvRequest";
    case NotificationKind.CV_GRANTED:
      return "cvGranted";
    case NotificationKind.NEW_MESSAGE:
      return "newMessage";
    case NotificationKind.NEW_JOB_MATCH:
      return "newJobMatch";
    case NotificationKind.NEW_TALENT:
      return "newTalent";
    case NotificationKind.BILLING:
    case NotificationKind.PAYMENT:
      return "billing";
    default:
      return null;
  }
}
