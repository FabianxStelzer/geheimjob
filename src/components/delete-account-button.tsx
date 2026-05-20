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
    <button type="button" onClick={onDelete} className="gj-btn-danger">
      Konto und Daten löschen
    </button>
  );
}
