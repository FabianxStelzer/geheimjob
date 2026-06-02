import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import type { Role } from "@prisma/client";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role as Role | undefined;

  if (pathname === "/login" && req.auth?.user) {
    const callback = req.nextUrl.searchParams.get("callbackUrl");
    const dest = callback?.startsWith("/") ? callback : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  if (!req.auth?.user && pathname.startsWith("/dashboard")) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (!role) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (role === "ADMIN") {
    if (
      pathname.startsWith("/dashboard/worker") ||
      pathname.startsWith("/dashboard/employer")
    ) {
      return NextResponse.redirect(new URL("/dashboard/admin", req.nextUrl.origin));
    }
  }

  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (pathname.startsWith("/dashboard/worker") && role !== "WORKER") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (pathname.startsWith("/dashboard/employer") && role !== "EMPLOYER") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
