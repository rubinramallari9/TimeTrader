import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/verify-email", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without auth
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // We rely on the client-side Zustand store for full auth state.
  // Here we do a lightweight check via the access token cookie (set optionally).
  // For a production setup you'd verify a httpOnly cookie here.
  // Since we use localStorage-based JWT, the middleware redirects to login
  // only for paths that explicitly need protection at the server level.
  const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/messages", "/sell", "/admin"];
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected) {
    // Check for an auth cookie set after login (optional pattern)
    const hasSession = request.cookies.has("adriel_session");
    if (!hasSession && !isPublic) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
