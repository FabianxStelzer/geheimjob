import Link from "next/link";
import type { EmployerPlan } from "@prisma/client";
import { AdminDataSection, AdminFieldGrid } from "@/components/admin-data-section";
import { AdminEmployerForm } from "@/components/admin-employer-form";
import { companyAgeYears } from "@/lib/employee-count-ranges";
import { planByCode } from "@/lib/billing-catalog";

type EmployerUser = {
  id: string;
  email: string;
  createdAt: Date;
  employerProfile: {
    id: string;
    publicSlug: string;
    companyName: string;
    industry: string;
    region: string;
    logoUrl: string | null;
    productsAndServices: string | null;
    companyDescription: string | null;
    companyBenefits: string | null;
    companyCulture: string | null;
    employeeCountRange: string | null;
    foundedYear: number | null;
    openPositionsNote: string | null;
    contactName: string;
    contactPhone: string | null;
    website: string | null;
    managingDirectorName: string | null;
    updatedAt: Date;
  } | null;
  subscription: {
    plan: string;
    billingStatus: string;
    paymentMethod: string | null;
    extraJobSlots: number;
    addonHighlight: boolean;
    addonContactAll: boolean;
    adminNote: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: Date | null;
  } | null;
};

type JobRow = {
  id: string;
  title: string;
  published: boolean;
  highlighted: boolean;
  employmentKind: string | null;
  createdAt: Date;
  _count: { matches: number };
};

type MatchRow = {
  id: string;
  status: string;
  hiringStage: string;
  createdAt: Date;
  workerProfile: { displayName: string; professionField: string };
  jobPosting: { title: string } | null;
};

export async function AdminEmployerDetailView({
  user,
  jobs,
  matches,
}: {
  user: EmployerUser;
  jobs: JobRow[];
  matches: MatchRow[];
}) {
  const p = user.employerProfile;
  if (!p) {
    return <p className="text-sm text-rose-700">Kein Unternehmensprofil hinterlegt.</p>;
  }

  const sub = user.subscription;
  const planName = (await planByCode((sub?.plan ?? "NONE") as EmployerPlan))?.name ?? "—";
  const ageYears = companyAgeYears(p.foundedYear);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-4">
          {p.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.logoUrl} alt="" className="h-16 w-16 rounded-xl object-cover ring-2 ring-white shadow" />
          ) : null}
          <div>
            <h1 className="text-xl font-bold text-[var(--gj-text)]">{p.companyName}</h1>
            <p className="mt-1 text-sm text-[var(--gj-muted)]">{user.email}</p>
          </div>
        </div>
        <Link href="/dashboard/admin/unternehmen" className="gj-btn-ghost text-sm">
          ← Zurück zur Liste
        </Link>
      </div>

      <AdminDataSection title="Konto">
        <AdminFieldGrid
          rows={[
            { label: "User-ID", value: <code className="text-xs">{user.id}</code> },
            { label: "E-Mail (Login)", value: user.email },
            { label: "Registriert", value: user.createdAt.toLocaleString("de-DE") },
            { label: "Öffentlicher Slug", value: p.publicSlug },
            { label: "Zuletzt aktualisiert", value: p.updatedAt.toLocaleString("de-DE") },
          ]}
        />
      </AdminDataSection>

      <AdminDataSection title="Unternehmensprofil">
        <AdminFieldGrid
          rows={[
            { label: "Firmenname", value: p.companyName },
            { label: "Branche", value: p.industry },
            { label: "Region", value: p.region },
            { label: "Mitarbeiter", value: p.employeeCountRange },
            {
              label: "Gründungsjahr",
              value: p.foundedYear
                ? `${p.foundedYear}${ageYears != null ? ` (${ageYears} Jahre)` : ""}`
                : "—",
            },
            { label: "Website", value: p.website },
            { label: "Ansprechpartner", value: p.contactName },
            { label: "Telefon", value: p.contactPhone },
            { label: "Geschäftsführer", value: p.managingDirectorName },
          ]}
        />
        {p.productsAndServices ? (
          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold uppercase text-[var(--gj-muted)]">Was wir machen</p>
            <p className="whitespace-pre-wrap rounded-lg border border-[var(--gj-border)] bg-white p-4 text-sm">
              {p.productsAndServices}
            </p>
          </div>
        ) : null}
        {p.companyDescription ? (
          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold uppercase text-[var(--gj-muted)]">Über uns</p>
            <p className="whitespace-pre-wrap rounded-lg border border-[var(--gj-border)] bg-white p-4 text-sm">
              {p.companyDescription}
            </p>
          </div>
        ) : null}
        {p.companyCulture ? (
          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold uppercase text-[var(--gj-muted)]">Kultur</p>
            <p className="whitespace-pre-wrap rounded-lg border border-[var(--gj-border)] bg-white p-4 text-sm">
              {p.companyCulture}
            </p>
          </div>
        ) : null}
        {p.companyBenefits ? (
          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold uppercase text-[var(--gj-muted)]">Benefits</p>
            <p className="whitespace-pre-wrap rounded-lg border border-[var(--gj-border)] bg-white p-4 text-sm">
              {p.companyBenefits}
            </p>
          </div>
        ) : null}
        {p.openPositionsNote ? (
          <div className="mt-4 space-y-1">
            <p className="text-xs font-semibold uppercase text-[var(--gj-muted)]">Stellenhinweis</p>
            <p className="whitespace-pre-wrap rounded-lg border border-[var(--gj-border)] bg-white p-4 text-sm">
              {p.openPositionsNote}
            </p>
          </div>
        ) : null}
      </AdminDataSection>

      <AdminDataSection title="Abonnement">
        <AdminFieldGrid
          rows={[
            { label: "Paket", value: planName },
            { label: "Status", value: sub?.billingStatus ?? "INACTIVE" },
            { label: "Zahlungsart", value: sub?.paymentMethod ?? "—" },
            { label: "Extra-Stellen", value: String(sub?.extraJobSlots ?? 0) },
            { label: "Highlight-Add-on", value: sub?.addonHighlight ? "Ja" : "Nein" },
            { label: "Contact-All-Add-on", value: sub?.addonContactAll ? "Ja" : "Nein" },
            {
              label: "Laufzeit bis",
              value: sub?.currentPeriodEnd?.toLocaleDateString("de-DE") ?? "—",
            },
            { label: "Stripe-Abo-ID", value: sub?.stripeSubscriptionId ?? "—" },
            { label: "Admin-Notiz", value: sub?.adminNote },
          ]}
        />
        <div className="mt-4">
          <AdminEmployerForm
            userId={user.id}
            companyName={p.companyName}
            email={user.email}
            plan={(sub?.plan ?? "NONE") as EmployerPlan}
            billingStatus={sub?.billingStatus ?? "INACTIVE"}
            paymentMethod={sub?.paymentMethod ?? ""}
            extraJobSlots={sub?.extraJobSlots ?? 0}
            addonHighlight={sub?.addonHighlight ?? false}
            addonContactAll={sub?.addonContactAll ?? false}
            adminNote={sub?.adminNote ?? ""}
          />
        </div>
      </AdminDataSection>

      <AdminDataSection title={`Stellenanzeigen (${jobs.length})`}>
        {jobs.length === 0 ? (
          <p className="text-sm text-[var(--gj-muted)]">Keine Stellen.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--gj-border)] text-xs uppercase text-[var(--gj-muted)]">
                  <th className="py-2 pr-4">Titel</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Art</th>
                  <th className="py-2 pr-4">Matches</th>
                  <th className="py-2">Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-b border-[var(--gj-border)]">
                    <td className="py-2 pr-4 font-medium">{j.title}</td>
                    <td className="py-2 pr-4">
                      {j.published ? "Veröffentlicht" : "Entwurf"}
                      {j.highlighted ? " · Hervorgehoben" : ""}
                    </td>
                    <td className="py-2 pr-4">{j.employmentKind ?? "—"}</td>
                    <td className="py-2 pr-4">{j._count.matches}</td>
                    <td className="py-2 text-[var(--gj-muted)]">
                      {j.createdAt.toLocaleDateString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminDataSection>

      <AdminDataSection title={`Matches & Anfragen (${matches.length})`}>
        {matches.length === 0 ? (
          <p className="text-sm text-[var(--gj-muted)]">Keine Matches.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--gj-border)] text-xs uppercase text-[var(--gj-muted)]">
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Stufe</th>
                  <th className="py-2 pr-4">Kandidat</th>
                  <th className="py-2 pr-4">Stelle</th>
                  <th className="py-2">Datum</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--gj-border)]">
                    <td className="py-2 pr-4">{m.status}</td>
                    <td className="py-2 pr-4">{m.hiringStage}</td>
                    <td className="py-2 pr-4">
                      {m.workerProfile.displayName}
                      <span className="block text-xs text-[var(--gj-muted)]">
                        {m.workerProfile.professionField}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{m.jobPosting?.title ?? "—"}</td>
                    <td className="py-2 text-[var(--gj-muted)]">
                      {m.createdAt.toLocaleDateString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminDataSection>
    </div>
  );
}
