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
        <input name="email" type="email" required className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Passwort (min. 8 Zeichen)</span>
        <input name="password" type="password" required minLength={8} className="gj-input" />
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
        <span className="gj-label">PLZ, Ort</span>
        <input name="region" required className="gj-input" placeholder="10115 Berlin" />
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
        <input name="website" type="url" className="gj-input" placeholder="https://…" />
      </label>
      <label className="block">
        <span className="gj-label">Offene Stellen / Hinweis (optional)</span>
        <textarea name="openPositionsNote" rows={3} className="gj-textarea" />
      </label>

      <div className="space-y-3 border-t border-[var(--gj-border)] pt-4">
        <div className="flex items-start gap-3 text-sm leading-relaxed text-[var(--gj-text-secondary)]">
          <input
            id="employer-gdprConsent"
            type="checkbox"
            name="gdprConsent"
            required
            aria-describedby="employer-gdpr-consent-text"
            className="mt-1 h-4 w-4 shrink-0"
          />
          <p id="employer-gdpr-consent-text">
            Ich habe die{" "}
            <Link
              href="/datenschutz"
              className="font-medium text-[var(--gj-primary)] underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Datenschutzerklärung
            </Link>{" "}
            gelesen und willige in die Verarbeitung ein.
          </p>
        </div>
        <div className="flex items-start gap-3 text-sm leading-relaxed text-[var(--gj-text-secondary)]">
          <input
            id="employer-termsConsent"
            type="checkbox"
            name="termsConsent"
            required
            aria-describedby="employer-terms-consent-text"
            className="mt-1 h-4 w-4 shrink-0"
          />
          <p id="employer-terms-consent-text">
            Ich akzeptiere die{" "}
            <Link
              href="/agb"
              className="font-medium text-[var(--gj-primary)] underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nutzungsbedingungen
            </Link>
            .
          </p>
        </div>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button type="submit" disabled={pending} className="gj-btn-primary w-full">
        {pending ? "Konto wird angelegt…" : "Unternehmen registrieren"}
      </button>
    </form>
  );
}
