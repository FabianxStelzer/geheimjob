"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerEmployerAction } from "@/app/actions/register";

export function RegisterEmployerForm() {
  const [state, action, pending] = useActionState(registerEmployerAction, {});

  return (
    <form action={action} className="gj-card mx-auto max-w-lg space-y-4 p-8 sm:p-10">
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
        <span className="gj-label">Firmenname</span>
        <input name="companyName" required className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Branche</span>
        <input name="industry" required className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Region</span>
        <input name="region" required className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Ansprechpartner</span>
        <input name="contactName" required className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Geschäftsführer / Inhaber (optional)</span>
        <input name="managingDirectorName" className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Telefon (optional)</span>
        <input name="contactPhone" className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Website (optional)</span>
        <input name="website" className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Offene Stellen / Hinweis</span>
        <textarea name="openPositionsNote" rows={3} className="gj-input" />
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

      <button type="submit" disabled={pending} className="gj-btn-primary">
        {pending ? "Speichern…" : "Unternehmen registrieren"}
      </button>
    </form>
  );
}
