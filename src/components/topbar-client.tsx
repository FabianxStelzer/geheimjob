"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { pageTitleFromPath } from "@/lib/page-title";

export function TopbarClient(props: {
  email: string | null | undefined;
  role: string | undefined;
  unread: number;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}) {
  const pathname = usePathname();
  return <Topbar title={pageTitleFromPath(pathname)} {...props} />;
}
