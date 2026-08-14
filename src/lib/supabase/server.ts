import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server-side Supabase client bound to the request's cookies.
 * Use inside Server Components, Server Actions and Route Handlers.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch {
            // Called from a Server Component: safe to ignore
          }
        },
      },
    },
  );
}
