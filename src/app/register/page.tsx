import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { BriefcaseIcon, BuildingIcon } from "@/components/icons";

export default function RegisterChoosePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--gj-bg)] px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 flex w-full max-w-2xl items-center justify-between gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-[var(--gj-primary)] hover:text-[var(--gj-primary-hover)]"
        >
          ← Zur Anmeldung
        </Link>
        <BrandLogo className="text-sm min-w-[100px]" />
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1">
        <div className="text-center">
          <h1 className="text-[28px] font-bold leading-tight text-[var(--gj-text)]">Registrieren</h1>
          <p className="mt-3 text-sm text-[var(--gj-muted)]">
            Wählen Sie Ihre Rolle — Arbeitnehmer und Arbeitgeber haben jeweils eine eigene Registrierung.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            href="/register/arbeitnehmer"
            className="gj-card gj-card-interactive group flex flex-col p-8 transition hover:shadow-lg"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gj-primary-soft)] text-[var(--gj-primary)]">
              <BriefcaseIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-[var(--gj-text)] group-hover:text-[var(--gj-primary)]">
              Als Arbeitnehmer
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--gj-muted)]">
              Profil anlegen, Stellen finden, diskret bewerben und Matches verwalten.
            </p>
            <span className="mt-6 text-sm font-semibold text-[var(--gj-primary)]">
              Zur Arbeitnehmer-Registrierung →
            </span>
          </Link>

          <Link
            href="/register/arbeitgeber"
            className="gj-card gj-card-interactive group flex flex-col p-8 transition hover:shadow-lg"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <BuildingIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-[var(--gj-text)] group-hover:text-[var(--gj-primary)]">
              Als Arbeitgeber
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--gj-muted)]">
              Unternehmen anlegen, Kandidaten suchen, Stellen schalten und Bewerbungen bearbeiten.
            </p>
            <span className="mt-6 text-sm font-semibold text-[var(--gj-primary)]">
              Zur Arbeitgeber-Registrierung →
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
