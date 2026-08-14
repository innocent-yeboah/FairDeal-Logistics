import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase session on every request and enforces
 * auth on protected routes (/account, /admin).
 *
 * Admin role gating is delegated to `src/app/admin/layout.tsx`, which
 * checks the `profiles.role` column, because middleware does not have
 * database access with proper RLS in a lightweight edge context.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          response.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const publicAccountPaths = ["/account/login", "/account/register", "/account/forgot-password", "/account/reset-password"];
  const isAccount =
    pathname.startsWith("/account") && !publicAccountPaths.some((p) => pathname.startsWith(p));
  const isAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isWholesalePortal =
    pathname.startsWith("/wholesale/dashboard") ||
    pathname.startsWith("/wholesale/catalog") ||
    pathname.startsWith("/wholesale/checkout");

  if ((isAccount || isAdmin || isWholesalePortal) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin/login" : "/account/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/paystack|.*\\..*).*)"],
};
