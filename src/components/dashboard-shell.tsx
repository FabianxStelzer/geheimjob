"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { DashboardNav } from "@/components/dashboard-nav";
import { TopbarClient } from "@/components/topbar-client";

const STORAGE_KEY = "geheimjob-sidebar-collapsed";

export function DashboardShell({
  role,
  email,
  unread,
  children,
}: {
  role: string | undefined;
  email: string | null | undefined;
  unread: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[var(--gj-bg)]">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[var(--gj-border)] bg-white transition-[width] duration-200 md:flex ${
          collapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[var(--gj-border)] ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {!collapsed ? (
            <Link href="/dashboard" className="min-w-0">
              <BrandLogo className="text-[1.125rem] min-w-[120px]" />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gj-primary-soft)] text-sm font-bold text-[var(--gj-primary)]"
              title="geheimjob.de"
            >
              G
            </Link>
          )}
          {!collapsed ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="rounded-lg p-2 text-[var(--gj-muted)] transition hover:bg-[var(--gj-primary-softer)] hover:text-[var(--gj-primary)]"
              aria-label="Sidebar einklappen"
            >
              ‹
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-6">
          <DashboardNav role={role} collapsed={collapsed} />
          {!collapsed ? (
            <div className="pt-6">
            <Link
              href="/dashboard/support"
              className="block px-3 py-2 text-xs text-[var(--gj-muted)] hover:text-[var(--gj-primary)]"
            >
              Support-Center
            </Link>
            </div>
          ) : null}
        </div>

        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="mx-auto mb-4 rounded-lg p-2 text-[var(--gj-muted)] hover:bg-[var(--gj-primary-softer)] hover:text-[var(--gj-primary)]"
            aria-label="Sidebar ausklappen"
          >
            ›
          </button>
        ) : null}
      </aside>

      <div
        className={`flex h-screen flex-col transition-[margin] duration-200 ${
          collapsed ? "md:ml-[4.5rem]" : "md:ml-64"
        }`}
      >
        <TopbarClient email={email} role={role} unread={unread} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
