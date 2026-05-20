"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerWorkerAction } from "@/app/actions/register";

export function RegisterWorkerForm({ referralCode }: { referralCode?: string }) {
  const [state, action, pending] = useActionState(registerWorkerAction, {});

  return (
    <form action={action} className="mx-auto max-w-lg space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <input type="hidden" name="referralCode" defaultValue={referralCode ?? ""} />

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
        <span className="text-zinc-600">Name (intern, nicht im anonymen Link)</span>
        <input name="displayName" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Berufsfeld</span>
        <input name="professionField" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Jahre Erfahrung</span>
        <input
          name="experienceYears"
          type="number"
          min={0}
          defaultValue={3}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Region</span>
        <input name="region" required className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Gehaltswunsch (brutto / Monat, optional)</span>
        <input name="salaryExpectation" type="number" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="salaryPublic" defaultChecked />
        Gehaltswunsch öffentlich zeigen
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Verfügbarkeit</span>
        <input name="availability" required placeholder="z. B. ab sofort" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Kurzprofil</span>
        <textarea name="bio" rows={4} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="text-zinc-600">LinkedIn</span>
          <input name="socialLinkedin" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="text-zinc-600">XING</span>
          <input name="socialXing" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="text-zinc-600">Website</span>
          <input name="socialWebsite" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" />
        </label>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="gdprConsent" required className="mt-1" />
        Ich habe die{" "}
        <Link href="/datenschutz" className="underline">
          Datenschutzerklärung
        </Link>{" "}
        gelesen und willige in die Verarbeitung ein.
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
        {pending ? "Speichern…" : "Konto anlegen"}
      </button>
    </form>
  );
}
