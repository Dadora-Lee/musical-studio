"use client";

import { KeyRound, LogIn, LogOut, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { buildSignedOutAuthContext, type AuthContext } from "@/lib/domain/access-control";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SidebarGoogleAccount({ authContext = buildSignedOutAuthContext() }: { authContext?: AuthContext }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDevAdminOpen, setIsDevAdminOpen] = useState(false);
  const [devAdminPassword, setDevAdminPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [devAdminStatus, setDevAdminStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(authMessage(authContext));
  const [devAdminMessage, setDevAdminMessage] = useState("로컬 개발 환경에서만 사용하는 임시 관리자 로그인입니다.");

  async function signIn() {
    const supabase = createSupabaseBrowserClient();
    setStatus("loading");
    setMessage("Google 로그인 준비 중");

    if (!supabase) {
      setStatus("error");
      setMessage("Supabase 환경변수 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요합니다.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "openid email profile"
      }
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function unlockDevAdmin() {
    setDevAdminStatus("loading");
    setDevAdminMessage("임시 관리자 권한 확인 중");

    const response = await fetch("/auth/dev-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: devAdminPassword })
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null) as { message?: string } | null;
      setDevAdminStatus("error");
      setDevAdminMessage(body?.message ?? "임시 관리자 로그인에 실패했습니다. 비밀번호를 확인해주세요.");
      return;
    }

    setDevAdminStatus("idle");
    setDevAdminMessage("임시 관리자 로그인 완료. 화면을 새로고침합니다.");
    window.location.href = "/";
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await fetch("/auth/dev-admin", { method: "DELETE" }).catch(() => null);
    await supabase?.auth.signOut();
    window.location.href = "/";
  }

  const email = authContext.profile?.email ?? authContext.user?.email ?? "연결 안 됨";
  const name = authContext.profile?.displayName ?? authContext.user?.name;

  return (
    <section className="mt-6 rounded-lg bg-white/10 p-3 text-xs text-blue-50">
      <div className="font-black text-white">Google 계정</div>
      <div className="mt-2 grid gap-1">
        <span className="text-blue-100">로그인 계정</span>
        <strong className="truncate text-white" title={email}>
          {email}
        </strong>
        {name ? <span className="truncate text-blue-100">{name}</span> : null}
        <span className="rounded bg-white/10 px-2 py-1 font-bold text-blue-100">{authStateLabel(authContext)}</span>
      </div>
      {authContext.state === "signed_out" ? (
        <div className="mt-3 grid gap-2">
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 font-black text-studio-navy"
            onClick={() => setIsLoginOpen(true)}
            type="button"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            {status === "loading" ? "로그인 중" : "Google 로그인"}
          </button>
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-3 py-2 font-black text-white"
            onClick={() => setIsDevAdminOpen(true)}
            type="button"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            임시 관리자 로그인
          </button>
        </div>
      ) : (
        <button
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 font-black text-studio-navy"
          onClick={signOut}
          type="button"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          로그아웃
        </button>
      )}
      <p className={`mt-2 leading-4 ${status === "error" ? "text-amber-200" : "text-blue-100"}`}>{message}</p>

      {isLoginOpen ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/50 p-4 text-slate-900">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="text-lg font-black">Google 로그인 화면</h2>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Supabase Auth를 통해 Google 계정으로 로그인합니다.
                </p>
              </div>
              <button
                aria-label="Google 로그인 화면 닫기"
                className="rounded-md border border-slate-200 p-2"
                onClick={() => setIsLoginOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="grid gap-3 p-4">
              <div className="rounded-md bg-slate-50 p-3 text-sm">
                <strong className="block">요청 권한</strong>
                <span className="mt-1 block text-xs text-slate-600">openid email profile · 기본 프로필</span>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-studio-navy px-4 py-3 text-sm font-black text-white"
                onClick={signIn}
                type="button"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                {status === "loading" ? "Google 로그인 중" : "내 Google 계정으로 계속"}
              </button>
              <button
                className="rounded-md border border-slate-300 px-4 py-3 text-sm font-black"
                onClick={() => setIsLoginOpen(false)}
                type="button"
              >
                취소
              </button>
              <p className={`text-xs font-bold ${status === "error" ? "text-amber-700" : "text-slate-500"}`}>{message}</p>
            </div>
          </div>
        </div>
      ) : null}

      {isDevAdminOpen ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/50 p-4 text-slate-900">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="text-lg font-black">임시 관리자 로그인</h2>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Google 계정 없이 로컬 개발용 관리자 권한을 잠시 사용합니다.
                </p>
              </div>
              <button
                aria-label="임시 관리자 로그인 닫기"
                className="rounded-md border border-slate-200 p-2"
                onClick={() => setIsDevAdminOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <form
              className="grid gap-3 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void unlockDevAdmin();
              }}
            >
              <label className="grid gap-2 text-sm font-black" htmlFor="dev-admin-password">
                관리자 비밀번호
                <input
                  autoComplete="current-password"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold outline-none focus:border-teal-600"
                  id="dev-admin-password"
                  onChange={(event) => setDevAdminPassword(event.target.value)}
                  placeholder="관리자 비밀번호 입력"
                  type="password"
                  value={devAdminPassword}
                />
              </label>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-studio-navy px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                disabled={devAdminStatus === "loading" || !devAdminPassword}
                type="submit"
              >
                <KeyRound className="h-4 w-4" aria-hidden />
                {devAdminStatus === "loading" ? "확인 중" : "관리자로 계속"}
              </button>
              <button
                className="rounded-md border border-slate-300 px-4 py-3 text-sm font-black"
                onClick={() => setIsDevAdminOpen(false)}
                type="button"
              >
                취소
              </button>
              <p className={`text-xs font-bold ${devAdminStatus === "error" ? "text-amber-700" : "text-slate-500"}`}>{devAdminMessage}</p>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function authMessage(context: AuthContext) {
  if (context.state === "active") return "Google 계정 로그인됨";
  if (context.state === "pending") return "멤버 승인 대기 중";
  if (context.state === "blocked") return "접근이 차단된 계정";
  return "연결 안 됨";
}

function authStateLabel(context: AuthContext) {
  if (context.state === "active") return context.profile?.appRole ?? "member";
  if (context.state === "pending") return "승인 대기";
  if (context.state === "blocked") return "차단됨";
  return "로그아웃";
}