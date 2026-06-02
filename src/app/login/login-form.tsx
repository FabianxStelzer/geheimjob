"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Login fehlgeschlagen. Bitte Zugangsdaten prüfen.");
        setPending(false);
        return;
      }

      // Vollständiger Reload, damit Session-Cookie sicher gesetzt ist
      window.location.assign(callbackUrl.startsWith("/") ? callbackUrl : "/dashboard");
    } catch {
      setError("Anmeldung fehlgeschlagen. Bitte später erneut versuchen.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="gj-label" htmlFor="login-email">
          E-Mail
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="gj-input"
          placeholder="name@beispiel.de"
        />
      </div>
      <div>
        <label className="gj-label" htmlFor="login-password">
          Passwort
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="gj-input"
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}

      <button type="submit" disabled={pending} className="gj-btn-primary w-full">
        {pending ? "Anmelden…" : "Anmelden"}
      </button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--gj-border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[var(--gj-muted)]">Noch kein Konto?</span>
        </div>
      </div>

      <Link href="/register" className="gj-btn-ghost w-full text-center">
        Registrieren
      </Link>
      <div className="grid gap-2 text-center text-xs text-[var(--gj-muted)] sm:grid-cols-2">
        <Link href="/register/arbeitnehmer" className="hover:text-[var(--gj-primary)] hover:underline">
          Arbeitnehmer
        </Link>
        <Link href="/register/arbeitgeber" className="hover:text-[var(--gj-primary)] hover:underline">
          Arbeitgeber
        </Link>
      </div>
    </form>
  );
}
