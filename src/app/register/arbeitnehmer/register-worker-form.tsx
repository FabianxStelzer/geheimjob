"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerWorkerAction } from "@/app/actions/register";
import { WORKER_AVAILABILITY_OPTIONS } from "@/lib/worker-availability";

export function RegisterWorkerForm({ referralCode }: { referralCode?: string }) {
  const [state, action, pending] = useActionState(registerWorkerAction, {});

  return (
    <form action={action} className="gj-card mx-auto max-w-lg space-y-4 p-8 sm:p-10">
      <input type="hidden" name="referralCode" defaultValue={referralCode ?? ""} />

      <label className="block">
        <span className="gj-label">E-Mail</span>
        <input name="email" type="email" required className="gj-input" />
      </label>
      <label className="block">
        <span className="gj-label">Passwort (min. 8 Zeichen)</span>
        <input name="password" type="password" required minLength={8} className="gj-input" />
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
        <span className="gj-label">PLZ, Ort</span>
        <input name="region" required className="gj-input" placeholder="10115 Berlin" />
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
        <select name="availability" required className="gj-input" defaultValue="">
          <option value="" disabled>
            Bitte wählen…
          </option>
          {WORKER_AVAILABILITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="gj-label">Kurzprofil</span>
        <textarea name="bio" rows={4} className="gj-textarea" />
      </label>

      <div className="space-y-3 border-t border-[var(--gj-border)] pt-4">
        <div className="flex items-start gap-3 text-sm leading-relaxed text-[var(--gj-text-secondary)]">
          <input
            id="gdprConsent"
            type="checkbox"
            name="gdprConsent"
            required
            aria-describedby="gdpr-consent-text"
            className="mt-1 h-4 w-4 shrink-0"
          />
          <p id="gdpr-consent-text">
            Ich habe die{" "}
            <Link
              href="/datenschutz"
              className="font-medium text-[var(--gj-primary)] underline underline-offset-2 hover:text-[var(--gj-primary-hover)]"
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
            id="termsConsent"
            type="checkbox"
            name="termsConsent"
            required
            aria-describedby="terms-consent-text"
            className="mt-1 h-4 w-4 shrink-0"
          />
          <p id="terms-consent-text">
            Ich akzeptiere die{" "}
            <Link
              href="/agb"
              className="font-medium text-[var(--gj-primary)] underline underline-offset-2 hover:text-[var(--gj-primary-hover)]"
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
        {pending ? "Konto wird angelegt…" : "Konto anlegen"}
      </button>
    </form>
  );
}
