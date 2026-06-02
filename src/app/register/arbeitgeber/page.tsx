import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { RegisterRoleSwitch } from "@/components/register-role-switch";
import { RegisterEmployerForm } from "./register-employer-form";

export default function ArbeitgeberRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--gj-bg)] px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 flex w-full max-w-lg items-center justify-between gap-4">
        <Link
          href="/register"
          className="text-sm font-medium text-[var(--gj-primary)] hover:text-[var(--gj-primary-hover)]"
        >
          ← Rolle wählen
        </Link>
        <BrandLogo className="text-sm min-w-[100px]" />
      </div>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6">
        <div className="text-center">
          <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
            Arbeitgeber
          </span>
          <h1 className="mt-4 text-[28px] font-bold leading-tight text-[var(--gj-text)]">
            Registrierung für Arbeitgeber
          </h1>
          <p className="mt-3 text-sm text-[var(--gj-muted)]">
            Unternehmensprofil anlegen und passende Kandidaten kontaktieren.
          </p>
        </div>
        <RegisterEmployerForm />
        <RegisterRoleSwitch current="employer" />
        <p className="text-center text-xs text-[var(--gj-muted)]">
          Bereits registriert?{" "}
          <Link href="/login" className="font-medium text-[var(--gj-primary)] hover:underline">
            Anmelden
          </Link>
        </p>
      </main>
    </div>
  );
}
