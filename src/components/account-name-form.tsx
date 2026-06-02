"use client";

import { useActionState } from "react";
import { updateAccountName } from "@/app/actions/dashboard";

export function AccountNameForm({ defaultName, label }: { defaultName: string; label: string }) {
  const [state, action, pending] = useActionState(updateAccountName, {});

  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
      <label className="block min-w-[240px] flex-1">
        <span className="gj-label">{label}</span>
        <input name="name" required minLength={2} className="gj-input" defaultValue={defaultName} />
      </label>
      <button type="submit" disabled={pending} className="gj-btn-primary">
        {pending ? "Speichern…" : "Name speichern"}
      </button>
      {state?.error ? (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      ) : state?.success ? (
        <p className="w-full text-sm text-emerald-700">{state.success}</p>
      ) : null}
    </form>
  );
}
