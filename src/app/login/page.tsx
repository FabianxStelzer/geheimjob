import Link from "next/link";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--gj-bg)]">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="gj-card w-full max-w-[420px] p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gj-primary)] to-[#a855f7] text-lg font-bold text-white shadow-lg shadow-[var(--gj-primary)]/30">
              G
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--gj-text)]">
              Geheim<span className="text-[var(--gj-primary)]">job</span>
            </h1>
            <p className="mt-1 text-sm text-[var(--gj-muted)]">Anmelden und loslegen.</p>
          </div>

          {sp.registered === "1" ? (
            <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900">
              Registrierung erfolgreich — Sie können sich jetzt anmelden.
            </p>
          ) : null}

          <LoginForm />

          <p className="mt-8 text-center text-xs text-[var(--gj-muted)]">
            <Link href="/datenschutz" className="hover:text-[var(--gj-primary)]">
              Datenschutz
            </Link>
            <span className="mx-2">·</span>
            <Link href="/agb" className="hover:text-[var(--gj-primary)]">
              Nutzungsbedingungen
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
