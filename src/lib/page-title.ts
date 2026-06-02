const map: Record<string, string> = {
  "/dashboard": "Übersicht",
  "/dashboard/worker": "Job-Suche",
  "/dashboard/worker/unternehmen": "Unternehmen",
  "/dashboard/worker/anfragen": "Bewerbungen",
  "/dashboard/worker/nachrichten": "Nachrichten",
  "/dashboard/worker/gehalt": "Gehalt & Steuern",
  "/dashboard/worker/ausschluesse": "Ausschlüsse",
  "/dashboard/worker/profil": "Profil",
  "/dashboard/worker/referral": "Referral",
  "/dashboard/employer": "Kandidaten-Suche",
  "/dashboard/employer/anfragen": "Anfragen",
  "/dashboard/employer/nachrichten": "Nachrichten",
  "/dashboard/employer/profil": "Unternehmensprofil",
  "/dashboard/employer/stellen": "Stellenanzeigen",
  "/dashboard/employer/abrechnung": "Pakete",
  "/dashboard/support": "Support-Center",
  "/dashboard/admin": "Super-Admin",
  "/dashboard/admin/unternehmen": "Unternehmen",
  "/dashboard/admin/arbeitnehmer": "Arbeitnehmer",
  "/dashboard/admin/einstellungen": "Einstellungen",
  "/dashboard/admin/pakete": "Einstellungen",
  "/dashboard/admin/abonnements": "Abonnements",
  "/dashboard/benachrichtigungen": "Benachrichtigungen",
  "/dashboard/einstellungen": "Einstellungen",
};

export function pageTitleFromPath(pathname: string): string {
  if (map[pathname]) return map[pathname];

  if (pathname.startsWith("/dashboard/worker/chat/")) return "Nachrichten";
  if (pathname.startsWith("/dashboard/employer/chat/")) return "Nachrichten";
  if (pathname.startsWith("/dashboard/worker/unternehmen/")) return "Unternehmen";

  return "geheimjob.de";
}
