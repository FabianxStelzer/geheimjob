"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-50"
    >
      Abmelden
    </button>
  );
}
