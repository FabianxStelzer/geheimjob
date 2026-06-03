"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { DashboardNav } from "@/components/dashboard-nav";
import { TopbarClient } from "@/components/topbar-client";
import { CloseIcon } from "@/components/icons";

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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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

  function toggleMobile() {
    setMobileOpen((v) => !v);
  }

  return (
    <div className="min-h-screen bg-[var(--gj-bg)]">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Menü schließen"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--gj-border)] bg-white transition-transform duration-200 md:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${collapsed ? "md:w-[4.5rem]" : "md:w-64"}`}
      >
        <div
          className={`flex h-16 shrink-0 items-center border-b border-[var(--gj-border)] ${
            collapsed ? "justify-between px-4 md:justify-center md:px-2" : "justify-between px-4"
          }`}
        >
          {!collapsed ? (
            <Link href="/dashboard" className="min-w-0" onClick={() => setMobileOpen(false)}>
              <BrandLogo className="text-[1.125rem] min-w-[120px]" />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="hidden h-9 w-9 items-center justify-center rounded-lg bg-[var(--gj-primary-soft)] text-sm font-bold text-[var(--gj-primary)] md:flex"
              title="geheimjob.de"
              onClick={() => setMobileOpen(false)}
            >
              G
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-[var(--gj-muted)] transition hover:bg-[var(--gj-primary-softer)] hover:text-[var(--gj-primary)] md:hidden"
              aria-label="Menü schließen"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            {!collapsed ? (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden rounded-lg p-2 text-[var(--gj-muted)] transition hover:bg-[var(--gj-primary-softer)] hover:text-[var(--gj-primary)] md:block"
                aria-label="Sidebar einklappen"
              >
                ‹
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-6">
          <div onClick={() => setMobileOpen(false)}>
            <DashboardNav role={role} collapsed={isDesktop && collapsed} />
          </div>
          {!collapsed ? (
            <div className="pt-6">
              <Link
                href="/dashboard/support"
                className="block px-3 py-2 text-xs text-[var(--gj-muted)] hover:text-[var(--gj-primary)]"
                onClick={() => setMobileOpen(false)}
              >
                Support-Center
              </Link>
            </div>
          ) : (
            <div className="hidden pt-6 md:block" />
          )}
        </div>

        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="mx-auto mb-4 hidden rounded-lg p-2 text-[var(--gj-muted)] hover:bg-[var(--gj-primary-softer)] hover:text-[var(--gj-primary)] md:block"
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
        <TopbarClient
          email={email}
          role={role}
          unread={unread}
          onMenuToggle={toggleMobile}
          menuOpen={mobileOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
