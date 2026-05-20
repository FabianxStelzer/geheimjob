"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerEmployerAction } from "@/app/actions/register";

export function RegisterEmployerForm() {
  const [state, action, pending] = useActionState(registerEmployerAction, {});

  return (
    <form action={action} className="mx-auto max-w-lg space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <label className="block text-sm">
        <span className="text-zinc-600">E-Mail</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Passwort (min. 8 Zeichen)</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Firmenname</span>
        <input name="companyName" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Branche</span>
        <input name="industry" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Region</span>
        <input name="region" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Ansprechpartner</span>
        <input name="contactName" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Telefon (optional)</span>
        <input name="contactPhone" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Website (optional)</span>
        <input name="website" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Offene Stellen / Hinweis</span>
        <textarea name="openPositionsNote" rows={3} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="gdprConsent" required className="mt-1" />
        Ich habe die{" "}
        <Link href="/datenschutz" className="underline">
          Datenschutzerklärung
        </Link>{" "}
        gelesen.
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="termsConsent" required className="mt-1" />
        Ich akzeptiere die{" "}
        <Link href="/agb" className="underline">
          Nutzungsbedingungen
        </Link>
        .
      </label>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Speichern…" : "Unternehmen registrieren"}
      </button>
    </form>
  );
}
