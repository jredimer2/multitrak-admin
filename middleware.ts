import { NextRequest, NextResponse } from "next/server";

const AUTH_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/verify",
  "/auth/receive-code",
];
const PRIVATE_PATHS = [
  "/admin",
  "/restore",
];

function isPathMatch(pathname: string, bases: string[]) {
  return bases.some((b) => pathname === b || pathname.startsWith(`${b}/`));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("session")?.value);

  // If authenticated, block access to auth pages
  if (hasSession && isPathMatch(pathname, AUTH_PATHS)) {
    const url = new URL("/admin", req.url);
    url.searchParams.set("msg", "already_signed_in");
    return NextResponse.redirect(url);
  }

  // If not authenticated, block access to private pages
  if (!hasSession && isPathMatch(pathname, PRIVATE_PATHS)) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("msg", "please_sign_in");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Ensure root paths AND subpaths are matched
  matcher: [
    "/auth",
    "/auth/:path*",
    "/admin",
    "/admin/:path*",
    "/restore",
    "/restore/:path*",
  ],
};