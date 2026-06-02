import { auth } from "@/auth";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getEmployerEntitlements } from "@/lib/employer-billing";

const ALLOWED_WITHOUT_BILLING = ["/dashboard/employer/abrechnung", "/dashboard/employer/profil"];

export default async function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    redirect("/dashboard");
  }

  const pathname = (await headers()).get("x-pathname") || "";
  const ent = await getEmployerEntitlements(session.user.id);

  if (
    !ent.isActive &&
    pathname.startsWith("/dashboard/employer") &&
    !ALLOWED_WITHOUT_BILLING.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    redirect("/dashboard/employer/abrechnung");
  }

  return (
    <>
      {!ent.isActive ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Zahlung erforderlich:</strong> Unternehmen benötigen ein aktives Paket für Talentpool und
          Stellen.{" "}
          <Link href="/dashboard/employer/abrechnung" className="font-semibold text-[var(--gj-primary)] underline">
            Jetzt Paket wählen
          </Link>
        </div>
      ) : (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--gj-muted)]">
          <span className="gj-chip gj-chip-solid">{ent.planName}</span>
          {ent.canPublishJobs ? (
            <span>
              Stellen: {ent.publishedJobsCount}/{ent.maxPublishedJobs}
            </span>
          ) : (
            <span>Nur Talentpool (keine Stellen)</span>
          )}
          {ent.contactAll ? <span className="gj-chip">Alle kontaktieren</span> : null}
        </div>
      )}
      {children}
    </>
  );
}
