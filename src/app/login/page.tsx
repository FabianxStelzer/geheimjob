import Link from "next/link";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="flex min-h-full flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="gj-card w-full max-w-[420px] p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-lg font-bold text-white shadow-lg shadow-teal-600/25">
              G
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Willkommen zurück</h1>
            <p className="mt-2 text-sm text-slate-500">Melden Sie sich an, um fortzufahren.</p>
          </div>

          {sp.registered === "1" ? (
            <p className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-center text-sm text-teal-900">
              Registrierung erfolgreich — Sie können sich jetzt anmelden.
            </p>
          ) : null}

          <LoginForm />

          <p className="mt-8 text-center text-xs text-slate-400">
            <Link href="/datenschutz" className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600">
              Datenschutz
            </Link>
            <span className="mx-2">·</span>
            <Link href="/agb" className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600">
              Nutzungsbedingungen
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
