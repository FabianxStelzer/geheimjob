import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateEmployerProfile } from "@/app/actions/dashboard";
import Link from "next/link";

export default async function EmployerProfilPage() {
  const session = await auth();
  const profile = await prisma.employerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!profile) return <p className="text-sm text-red-600">Kein Profil.</p>;

  return (
    <div className="space-y-6">
      <section className="gj-card p-6">
        <h2 className="mb-4 text-base font-semibold">Unternehmensprofil</h2>
        <form action={updateEmployerProfile} className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="gj-label">Logo für Stellenanzeigen (Bild‑URL)</span>
            <input name="logoUrl" type="url" defaultValue={profile.logoUrl ?? ""} className="gj-input" placeholder="https://…" />
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Firmenname</span>
            <input name="companyName" defaultValue={profile.companyName} required className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Branche</span>
            <input name="industry" defaultValue={profile.industry} required className="gj-input" />
          </label>
          <label>
            <span className="gj-label">Region</span>
            <input name="region" defaultValue={profile.region} required className="gj-input" />
          </label>
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
          <label className="md:col-span-2">
            <span className="gj-label">Website</span>
            <input name="website" defaultValue={profile.website ?? ""} className="gj-input" />
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Über das Unternehmen</span>
            <textarea
              name="companyDescription"
              rows={5}
              defaultValue={profile.companyDescription ?? ""}
              className="gj-textarea"
              placeholder="Was macht Ihr Unternehmen? Kultur, Benefits, Standorte…"
            />
          </label>
          <label className="md:col-span-2">
            <span className="gj-label">Offene Stellen / Hinweis</span>
            <textarea name="openPositionsNote" rows={4} defaultValue={profile.openPositionsNote ?? ""} className="gj-textarea" />
          </label>
          <div className="md:col-span-2 pt-2">
            <button type="submit" className="gj-btn-primary">Speichern</button>
          </div>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="mb-1 text-base font-semibold">Konto</h2>
        <p className="mb-4 text-sm text-[var(--gj-muted)]">
          Einstellungen, Datenschutz und Kontolöschung finden Sie unter Einstellungen (Avatar oben rechts).
        </p>
        <Link href="/dashboard/einstellungen" className="gj-btn-ghost text-sm">
          Zu den Einstellungen
        </Link>
      </section>
    </div>
  );
}
