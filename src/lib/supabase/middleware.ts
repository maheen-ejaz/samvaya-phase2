import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/auth", "/legal", "/test"];

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
            supabaseResponse.cookies.set(name, value, options)
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
      .select("role")
      .eq("id", user.id)
      .single();

    const role = userData?.role ?? "applicant";
    const isAdmin = role === "admin" || role === "super_admin";

    // Already authenticated and on auth pages → redirect to correct area
    if (pathname.startsWith("/auth")) {
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
  }

  return supabaseResponse;
}
