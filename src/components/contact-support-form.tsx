"use client";

import { useActionState } from "react";
import { submitContactInquiry } from "@/app/actions/dashboard";

export function ContactSupportForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const [state, action, pending] = useActionState(submitContactInquiry, {});

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="gj-label">Ihr Name</span>
        <input name="name" required className="gj-input" defaultValue={defaultName} />
      </label>
      <label className="block">
        <span className="gj-label">E-Mail</span>
        <input name="email" type="email" required className="gj-input" defaultValue={defaultEmail} />
      </label>
      <label className="block">
        <span className="gj-label">Nachricht</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={6}
          className="gj-textarea"
          placeholder="Worum geht es? Bitte beschreiben Sie Ihr Anliegen…"
        />
      </label>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {state.success}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="gj-btn-primary">
        {pending ? "Senden…" : "Nachricht senden"}
      </button>
    </form>
  );
}
