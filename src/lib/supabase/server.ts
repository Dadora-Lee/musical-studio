/**
 * Supabase 서버 클라이언트
 * Server Component, Route Handler, Server Action에서 사용.
 * cookies()를 통해 세션 추출.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 set 호출 시 무시 (read-only)
          }
        },
      },
    },
  );
}
