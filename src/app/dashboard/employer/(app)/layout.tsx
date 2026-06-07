import { auth } from "@/auth";
import { getEmployerEntitlements } from "@/lib/employer-billing";
import { redirect } from "next/navigation";

/** Talentpool & Stellen — nur mit aktivem Paket. Pakete/Profil liegen außerhalb dieser Gruppe. */
export default async function EmployerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    redirect("/dashboard");
  }

  const ent = await getEmployerEntitlements(session.user.id);
  if (!ent.isActive) {
    redirect("/dashboard/employer/abrechnung");
  }

  return children;
}
