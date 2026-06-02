import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;

  if (session?.user) {
    const target = sp.callbackUrl?.startsWith("/") ? sp.callbackUrl : "/dashboard";
    redirect(target);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--gj-bg)]">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="gj-card w-full max-w-[420px] p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <BrandLogo className="text-2xl min-w-[120px]" />
            <p className="mt-3 text-sm text-[var(--gj-muted)]">Anmelden und loslegen.</p>
          </div>

          {sp.registered === "1" ? (
            <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900">
              Registrierung erfolgreich — Sie können sich jetzt anmelden.
            </p>
          ) : null}

          <Suspense fallback={<p className="text-sm text-[var(--gj-muted)]">Laden…</p>}>
            <LoginForm />
          </Suspense>

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
