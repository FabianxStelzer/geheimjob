"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Login fehlgeschlagen. Bitte Zugangsdaten prüfen.");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <label className="block text-sm">
        <span className="text-zinc-600">E-Mail</span>
        <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Passwort</span>
        <input name="password" type="password" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Anmelden…" : "Anmelden"}
      </button>
      <p className="text-center text-sm text-zinc-600">
        Noch kein Konto?{" "}
        <Link href="/register/arbeitnehmer" className="underline">
          Arbeitnehmer
        </Link>{" "}
        ·{" "}
        <Link href="/register/arbeitgeber" className="underline">
          Arbeitgeber
        </Link>
      </p>
    </form>
  );
}
