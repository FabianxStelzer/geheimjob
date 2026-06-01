"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      className="gj-btn-ghost w-full justify-center"
    >
      Abmelden
    </button>
  );
}
