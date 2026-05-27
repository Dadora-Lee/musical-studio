/**
 * Next.js Edge Middleware.
 *
 * 책임:
 * 1. Supabase 세션 갱신 (모든 요청에 대해)
 * 2. Dev 환경 외부 접속 시 토큰 인증 강제 (T44)
 *
 * 자세한 보안 정책: AGENTS.md, docs/agents/safety.md 참조.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function middleware(request: NextRequest) {
  // ─── 1) Dev 환경 외부 접속 토큰 검증 ─────────────────────
  // 프로덕션에선 작동 안 함. localhost는 통과.
  if (process.env.NODE_ENV === 'development') {
    const host = request.headers.get('host') ?? '';
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
    const requiredToken = process.env.DEV_ACCESS_TOKEN;

    if (!isLocalhost && requiredToken) {
      const provided =
        request.cookies.get('dev-access-token')?.value ??
        request.nextUrl.searchParams.get('token');

      if (provided !== requiredToken) {
        // 쿼리에 토큰 있으면 쿠키로 저장 후 redirect
        const queryToken = request.nextUrl.searchParams.get('token');
        if (queryToken === requiredToken) {
          const cleanUrl = new URL(request.url);
          cleanUrl.searchParams.delete('token');
          const res = NextResponse.redirect(cleanUrl);
          res.cookies.set('dev-access-token', queryToken, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          });
          return res;
        }
        return new NextResponse('Dev access required. URL에 ?token=... 추가하거나 쿠키 설정.', {
          status: 401,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    }
  }

  // ─── 2) Supabase 세션 갱신 ──────────────────────────────
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }: CookieToSet) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // 세션 refresh trigger
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  // /api/health 는 인프라 모니터링용 (Partner/외부 monitor가 토큰 없이 접근).
  // _next 정적 자원 + favicon + 미디어 파일도 middleware 제외.
  matcher: [
    '/((?!api/health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|mp3|wav|m4a|mxl|musicxml)$).*)',
  ],
};
