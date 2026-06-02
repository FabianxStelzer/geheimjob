import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WorkerNetCalcForm } from "@/components/worker-net-calc-form";
import { hasNetCalcSettings } from "@/lib/income-display";

export default async function WorkerGehaltPage() {
  const session = await auth();
  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!profile) {
    return <p className="text-sm text-red-600">Kein Profil gefunden.</p>;
  }

  const configured = hasNetCalcSettings(
    profile.taxClass
      ? {
          taxClass: profile.taxClass,
          churchTax: profile.churchTax,
          federalState: profile.federalState,
        }
      : null,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Gehalt & Steuern</h1>
        <p className="mt-2 text-sm text-[var(--gj-muted)]">
          Hinterlegen Sie Ihre Steuerdaten, damit in der{" "}
          <Link href="/dashboard/worker" className="font-medium text-[var(--gj-primary)] hover:underline">
            Job-Suche
          </Link>{" "}
          bei Brutto-Angaben automatisch eine Netto-Schätzung (ca.) eingeblendet wird.
        </p>
      </header>

      {configured ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Netto-Schätzung ist aktiv — Steuerklasse {profile.taxClass}
          {profile.churchTax ? ", mit Kirchensteuer" : ""}.
        </p>
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Noch keine Steuerklasse hinterlegt. Bitte mindestens die Steuerklasse auswählen und speichern.
        </p>
      )}

      <section className="gj-card p-6">
        <h2 className="mb-1 text-base font-semibold">Netto-Schätzung</h2>
        <p className="mb-6 text-sm text-[var(--gj-muted)]">
          Die Berechnung berücksichtigt Sozialabgaben, Einkommensteuer und optional Kirchensteuer — als
          Orientierung, nicht als verbindliche Abrechnung.
        </p>
        <WorkerNetCalcForm
          taxClass={profile.taxClass}
          churchTax={profile.churchTax}
          federalState={profile.federalState}
        />
      </section>
    </div>
  );
}
