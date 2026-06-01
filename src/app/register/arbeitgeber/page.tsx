import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { RegisterEmployerForm } from "./register-employer-form";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--gj-bg)] px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 flex w-full max-w-lg items-center justify-between gap-4">
        <Link href="/login" className="text-sm font-medium text-[var(--gj-primary)] hover:text-[var(--gj-primary-hover)]">
          ← Zur Anmeldung
        </Link>
        <BrandLogo className="text-sm min-w-[100px]" />
      </div>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6">
        <div className="text-center">
          <h1 className="text-[28px] font-bold leading-tight text-[var(--gj-text)]">Arbeitgeber-Registrierung</h1>
          <p className="mt-3 text-sm text-[var(--gj-muted)]">
            Unternehmensprofil anlegen und passende Kandidaten kontaktieren — nach vorheriger Match-Freigabe.
          </p>
        </div>
        <RegisterEmployerForm />
      </main>
    </div>
  );
}
