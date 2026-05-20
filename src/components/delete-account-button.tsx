"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function DeleteAccountButton() {
  const router = useRouter();

  async function onDelete() {
    if (!confirm("Konto wirklich löschen? Dies kann nicht rückgängig gemacht werden.")) {
      return;
    }
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      alert("Löschen fehlgeschlagen.");
      return;
    }
    await signOut({ callbackUrl: "/" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
    >
      Konto und Daten löschen
    </button>
  );
}
