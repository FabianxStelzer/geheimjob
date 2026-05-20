"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/login" })}
      className="gj-btn-ghost w-full justify-center text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
    >
      Abmelden
    </button>
  );
}
