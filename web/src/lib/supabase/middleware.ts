import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 1. Check bypass flag
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  // 2. Safety check: Never run middleware logic on /login, /, or /_next/**, or static files
  const pathname = request.nextUrl.pathname;
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Fast Demo Access / Zero-Lockout check
  const clearanceLevel = request.cookies.get("bs_clearance_level")?.value;
  if (clearanceLevel && parseInt(clearanceLevel, 10) >= 1) {
    return NextResponse.next();
  }

  // 4. Supabase session verification
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return supabaseResponse;
      }
    } catch {
      // Non-blocking fallback to redirect
    }
  }

  // 5. Unauthenticated redirect using request.nextUrl.clone()
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}
