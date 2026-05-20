"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { BellIcon, ChevronDownIcon } from "@/components/icons";

export function Topbar({
  title,
  email,
  role,
  unread,
}: {
  title: string;
  email: string | null | undefined;
  role: string | undefined;
  unread: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = (email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--gj-border)] bg-white/95 px-4 backdrop-blur md:px-8">
      <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--gj-text)]">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/benachrichtigungen"
          className="relative rounded-full p-2 text-[var(--gj-muted)] transition-colors hover:bg-[var(--gj-primary-softer)] hover:text-[var(--gj-primary)]"
        >
          <BellIcon />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-[var(--gj-primary)]" />
          ) : null}
        </Link>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--gj-primary-softer)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gj-primary)] to-[#a855f7] text-xs font-semibold text-white shadow-sm">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-[var(--gj-text)]">
                {email ? email.split("@")[0] : "—"}
              </span>
              <span className="block text-[11px] leading-tight text-[var(--gj-muted)]">{email}</span>
            </span>
            <ChevronDownIcon className="hidden text-[var(--gj-muted)] sm:block" />
          </button>

          {open ? (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--gj-border)] bg-white py-1 shadow-lg">
              <div className="border-b border-[var(--gj-border)] px-3 py-2">
                <p className="truncate text-sm font-semibold text-[var(--gj-text)]">{email}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--gj-muted)]">
                  {role ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/login" })}
                className="block w-full px-3 py-2 text-left text-sm text-[var(--gj-text)] transition-colors hover:bg-[var(--gj-primary-softer)] hover:text-[var(--gj-primary)]"
              >
                Abmelden
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
