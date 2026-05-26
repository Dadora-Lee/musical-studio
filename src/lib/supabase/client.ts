/**
 * Supabase 브라우저 클라이언트
 * 클라이언트 컴포넌트에서 사용. anon key만 노출.
 * server.ts와 함께 use.
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
