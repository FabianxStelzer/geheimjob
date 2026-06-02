import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname === "/login" && req.auth?.user) {
    const callback = req.nextUrl.searchParams.get("callbackUrl");
    const dest = callback?.startsWith("/") ? callback : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  if (!req.auth && pathname.startsWith("/dashboard")) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (!role) return NextResponse.next();

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
