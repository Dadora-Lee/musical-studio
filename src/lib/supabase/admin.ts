/**
 * Supabase 관리자 클라이언트 (service_role 사용)
 * ⚠️ Route Handler / Server Action 전용. 클라이언트에 절대 노출 금지.
 * RLS 우회하므로 사용 시 명시적 권한 검증 필수.
 */
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient는 서버에서만 호출 가능합니다.');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
