import Link from "next/link";
import { RegisterEmployerForm } from "./register-employer-form";

export default function Page() {
  return (
    <div className="flex min-h-full flex-col px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 flex w-full max-w-lg items-center justify-between gap-4">
        <Link href="/login" className="text-sm font-medium text-teal-700 hover:text-teal-900">
          ← Zur Anmeldung
        </Link>
      </div>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Arbeitgeber-Registrierung</h1>
          <p className="mt-3 text-sm text-slate-500">
            Unternehmensprofil anlegen und passende Kandidaten kontaktieren — nach vorheriger Match-Freigabe.
          </p>
        </div>
        <RegisterEmployerForm />
      </main>
    </div>
  );
}
