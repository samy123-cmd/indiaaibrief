import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/dashboard", "/account"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Auth middleware only — do NOT run on public content pages.
 * Calling Supabase getUser() on every request Set-Cookies and forces
 * Cache-Control: no-store, which blocks bfcache and hurts LCP/TBT.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = await updateSession(request);

  if (!isProtected(pathname)) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signIn);
  }

  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // no-op — updateSession already handled cookies on response
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set(
      "redirect_url",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(signIn);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/update-password",
    "/auth/callback",
  ],
};
