const map: Record<string, string> = {
  "/dashboard": "Übersicht",
  "/dashboard/worker": "Job-Suche",
  "/dashboard/worker/anfragen": "Bewerbungen",
  "/dashboard/worker/nachrichten": "Nachrichten",
  "/dashboard/worker/profil": "Profil",
  "/dashboard/worker/referral": "Referral",
  "/dashboard/worker/ausschluesse": "Profil · Ausschlüsse",
  "/dashboard/employer": "Kandidaten-Suche",
  "/dashboard/employer/anfragen": "Anfragen",
  "/dashboard/employer/nachrichten": "Nachrichten",
  "/dashboard/employer/profil": "Unternehmensprofil",
  "/dashboard/employer/stellen": "Stellenanzeigen",
  "/dashboard/employer/abrechnung": "Abrechnung",
  "/dashboard/admin": "Administration",
  "/dashboard/benachrichtigungen": "Benachrichtigungen",
};

export function pageTitleFromPath(pathname: string): string {
  if (map[pathname]) return map[pathname];

  if (pathname.startsWith("/dashboard/worker/chat/")) return "Nachrichten";
  if (pathname.startsWith("/dashboard/employer/chat/")) return "Nachrichten";

  return "Geheimjob";
}
