import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/auth", "/legal"];

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: options?.sameSite ?? 'lax',
              secure: options?.secure ?? process.env.NODE_ENV === 'production',
            })
          );
        },
      },
    }
  );

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Unauthenticated user on a protected route → redirect to login
  if (!user && !isPublicRoute(pathname) && !pathname.startsWith('/api/')) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user → enforce role-based routing
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role, membership_status")
      .eq("id", user.id)
      .single();

    const role = userData?.role ?? "applicant";
    const isAdmin = role === "admin" || role === "super_admin";
    const membershipStatus = userData?.membership_status ?? "onboarding_pending";

    // Already authenticated and on auth pages → redirect to correct area
    // Exception: /auth/signout must be reachable to clear the session
    if (pathname.startsWith("/auth") && pathname !== "/auth/signout") {
      // Honor ?next= param if it's a safe relative path for the user's role
      const nextParam = request.nextUrl.searchParams.get("next");
      let redirectPath = isAdmin ? "/admin" : "/app";

      if (nextParam && nextParam.startsWith("/")) {
        const allowedPrefix = isAdmin ? "/admin" : "/app";
        // Exact match or path segment match to prevent open redirect (e.g. /app-evil.com)
        if (
          nextParam === allowedPrefix ||
          nextParam.startsWith(allowedPrefix + "/")
        ) {
          redirectPath = nextParam;
        }
      }

      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Applicant trying to access admin area → redirect to /app
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/app", request.url));
    }

    // Admin trying to access applicant area → redirect to /admin
    if (pathname.startsWith("/app") && isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Block PWA routes for form-only users (onboarding_complete but not yet active)
    // Allow: /app, /app/onboarding — Block: /app/matches, /app/profile, /app/settings
    if (
      !isAdmin &&
      membershipStatus === "onboarding_complete" &&
      pathname.startsWith("/app/") &&
      !pathname.startsWith("/app/onboarding")
    ) {
      const blockedPrefixes = ["/app/matches", "/app/profile", "/app/settings"];
      if (blockedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.redirect(new URL("/app", request.url));
      }
    }
  }

  return supabaseResponse;
}
