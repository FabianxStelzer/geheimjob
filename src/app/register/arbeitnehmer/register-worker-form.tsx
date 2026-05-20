"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerWorkerAction } from "@/app/actions/register";

export function RegisterWorkerForm({ referralCode }: { referralCode?: string }) {
  const [state, action, pending] = useActionState(registerWorkerAction, {});

  return (
    <form action={action} className="gj-card mx-auto max-w-lg space-y-4 p-8 sm:p-10">
      <input type="hidden" name="referralCode" defaultValue={referralCode ?? ""} />

      <label className="block">
        <span className="gj-label">E-Mail</span>
        <input
          name="email"
          type="email"
          required
          className="gj-input"
        />
      </label>
      <label className="block">
        <span className="gj-label">Passwort (min. 8 Zeichen)</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="gj-input"
        />
      </label>
      <label className="block">
        <span className="gj-label">Name (intern, nicht im anonymen Link)</span>
        <input name="displayName" required className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Berufsfeld</span>
        <input name="professionField" required className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Jahre Erfahrung</span>
        <input
          name="experienceYears"
          type="number"
          min={0}
          defaultValue={3}
          className="gj-input"
        />
      </label>
      <label className="block">
        <span className="gj-label">Region</span>
        <input name="region" required className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Gehaltswunsch (brutto / Monat, optional)</span>
        <input name="salaryExpectation" type="number" className="gj-input" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="salaryPublic" defaultChecked />
        Gehaltswunsch öffentlich zeigen
      </label>
      <label className="block">
        <span className="gj-label">Verfügbarkeit</span>
        <input name="availability" required placeholder="z. B. ab sofort" className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Kurzprofil</span>
        <textarea name="bio" rows={4} className="gj-input" />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="gj-label">LinkedIn</span>
          <input name="socialLinkedin" className="gj-input" />
        </label>
        <label className="block">
          <span className="gj-label">XING</span>
          <input name="socialXing" className="gj-input" />
        </label>
        <label className="block">
          <span className="gj-label">Website</span>
          <input name="socialWebsite" className="gj-input" />
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

      <button type="submit" disabled={pending} className="gj-btn-primary">
        {pending ? "Speichern…" : "Konto anlegen"}
      </button>
    </form>
  );
}
