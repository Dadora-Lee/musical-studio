/**
 * 랜딩 페이지.
 * MVP 단계 placeholder. 로그인 라우트로 안내.
 */
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">🎵 Musical Studio</h1>
        <p className="text-slate-600">
          뮤지컬 넘버 연습을 위한 악보 + MR + 녹음 + 숙제 제출 플랫폼
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/auth/login"
            className="block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            로그인
          </Link>
          <Link
            href="/api/health"
            className="block text-sm text-slate-500 hover:text-slate-700"
          >
            서버 상태 확인 →
          </Link>
        </div>
        <p className="text-xs text-slate-400 pt-6">
          v0.1.0 · Apache-2.0 ·{' '}
          <a
            href="https://github.com/Dadora-Lee/musical-studio"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>
    </main>
  );
}
