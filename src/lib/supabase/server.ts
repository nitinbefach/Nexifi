import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// No-op client for build/prerender when env vars aren't available.
// Returns { data: null, error: null } for any query chain.
function createNoOpClient() {
  const handler: ProxyHandler<object> = {
    get() {
      return new Proxy(() => {}, {
        apply() {
          return new Proxy({ data: null, error: null }, { get: (t, p) => (p in t ? (t as any)[p] : new Proxy(() => {}, { apply: () => new Proxy({ data: null, error: null }, handler) })) });
        },
        get() {
          return new Proxy(() => {}, {
            apply() {
              return new Proxy({ data: null, error: null }, handler);
            },
            get: () => new Proxy(() => {}, { apply: () => new Proxy({ data: null, error: null }, handler) }),
          });
        },
      });
    },
  };
  return new Proxy({} as ReturnType<typeof createServerClient>, handler);
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build/prerender, env vars may not exist — return a safe no-op client
  if (!url || !key) {
    return createNoOpClient();
  }

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method is called from a Server Component.
          // This can be ignored if middleware refreshes user sessions.
        }
      },
    },
  });
}
