import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateEmployerProfile } from "@/app/actions/dashboard";
import { EmployerLogoUpload } from "@/components/employer-logo-upload";
import { EMPLOYEE_COUNT_RANGE_OPTIONS } from "@/lib/employee-count-ranges";

export default async function EmployerProfilPage() {
  const session = await auth();
  const profile = await prisma.employerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!profile) return <p className="text-sm text-red-600">Kein Profil.</p>;

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <section className="gj-card p-6">
        <h2 className="mb-1 text-base font-semibold">Unternehmensprofil</h2>
        <p className="mb-6 text-sm text-[var(--gj-muted)]">
          Diese Angaben sehen Arbeitnehmer unter „Unternehmen“ — je vollständiger, desto überzeugender
          Ihr Auftritt.
        </p>
        <EmployerLogoUpload
          logoUrl={profile.logoUrl}
          logoSquareUrl={profile.logoSquareUrl}
          companyName={profile.companyName}
        />

        <form action={updateEmployerProfile} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="gj-label">Firmenname</span>
            <input name="companyName" defaultValue={profile.companyName} required className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Branche</span>
            <input name="industry" defaultValue={profile.industry} required className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Region / Standort</span>
            <input name="region" defaultValue={profile.region} required className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Mitarbeiterzahl</span>
            <select
              name="employeeCountRange"
              defaultValue={profile.employeeCountRange ?? ""}
              className="gj-input"
            >
              <option value="">— Bitte wählen —</option>
              {EMPLOYEE_COUNT_RANGE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o} Mitarbeitende
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="gj-label">Gründungsjahr</span>
            <input
              name="foundedYear"
              type="number"
              min={1800}
              max={currentYear}
              defaultValue={profile.foundedYear ?? ""}
              className="gj-input"
              placeholder={`z. B. ${currentYear - 10}`}
            />
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Was macht Ihr Unternehmen?</span>
            <textarea
              name="productsAndServices"
              rows={4}
              defaultValue={profile.productsAndServices ?? ""}
              className="gj-textarea"
              placeholder="Produkte, Dienstleistungen, Zielgruppe — konkret und verständlich."
            />
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Über uns (Kurzportrait)</span>
            <textarea
              name="companyDescription"
              rows={5}
              defaultValue={profile.companyDescription ?? ""}
              className="gj-textarea"
              placeholder="Geschichte, Mission, Standorte, Besonderheiten…"
            />
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Benefits &amp; Rahmenbedingungen</span>
            <textarea
              name="companyBenefits"
              rows={4}
              defaultValue={profile.companyBenefits ?? ""}
              className="gj-textarea"
              placeholder="Homeoffice, Weiterbildung, Team-Events, Firmenwagen…"
            />
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Kultur &amp; Arbeitsweise</span>
            <textarea
              name="companyCulture"
              rows={4}
              defaultValue={profile.companyCulture ?? ""}
              className="gj-textarea"
              placeholder="Wie arbeitet ihr? Werte, Teamgröße, Führungsstil…"
            />
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Offene Stellen / Hinweis</span>
            <textarea
              name="openPositionsNote"
              rows={3}
              defaultValue={profile.openPositionsNote ?? ""}
              className="gj-textarea"
              placeholder="Kurzer Überblick über aktuelle Rollen (ergänzt Ihre Stellenanzeigen)."
            />
          </label>

          <div className="md:col-span-2 border-t border-[var(--gj-border)] pt-6">
            <h3 className="text-sm font-semibold text-[var(--gj-text)]">Kontakt (intern)</h3>
            <p className="mt-1 text-xs text-[var(--gj-muted)]">
              Nicht öffentlich auf der Unternehmensseite — nur für die Plattform und Matches.
            </p>
          </div>
          <label>
            <span className="gj-label">Ansprechpartner</span>
            <input name="contactName" defaultValue={profile.contactName} required className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Geschäftsführer / Inhaber</span>
            <input
              name="managingDirectorName"
              defaultValue={profile.managingDirectorName ?? ""}
              className="gj-input"
              placeholder="Für Ausschluss-Abgleich durch Kandidaten"
            />
          </label>
          <label>
            <span className="gj-label">Telefon</span>
            <input name="contactPhone" defaultValue={profile.contactPhone ?? ""} className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Website</span>
            <input name="website" defaultValue={profile.website ?? ""} className="gj-input" />
          </label>

          <div className="md:col-span-2 pt-2">
            <button type="submit" className="gj-btn-primary">
              Profil speichern
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
