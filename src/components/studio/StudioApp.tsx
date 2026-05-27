"use client";

import { useReducer } from "react";
import { AppShell } from "./AppShell";
import { DashboardCards } from "./DashboardCards";
import { DirectorSubmissions } from "./DirectorSubmissions";
import { FeedbackCards } from "./FeedbackCards";
import { GoogleDrivePanel } from "./GoogleDrivePanel";
import { WorkPanel } from "./WorkPanel";
import { buildSignedOutAuthContext, canAccessView, getPrimaryRole, getVisibleViews, type AuthContext } from "@/lib/domain/access-control";
import {
  createInitialInteractionState,
  reduceInteraction,
  type DashboardView,
  viewLabel
} from "@/lib/domain/interaction-state";

const tabs: DashboardView[] = ["dashboard", "work", "submit", "drive", "director", "admin"];

export function StudioApp({
  authContext = buildSignedOutAuthContext(),
  authError,
  initialView = "dashboard"
}: {
  authContext?: AuthContext;
  authError?: string;
  initialView?: DashboardView;
}) {
  const [state, dispatch] = useReducer(reduceInteraction, initialView, createInitialInteractionState);
  const visibleViews = getVisibleViews(authContext);
  const activeView = canAccessView(authContext, state.activeView) ? state.activeView : visibleViews[0] ?? state.activeView;
  const activeRole = getPrimaryRole(authContext);

  return (
    <AppShell active="Dashboard" authContext={authContext}>
      <header className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black">뮤지컬 넘버 연습실</h1>
          <p className="mt-1 text-sm text-slate-600">
            Google Drive 악보/MR · Google 로그인 · WAV sync source · MP3 export later
          </p>
        </div>
        <span className="w-fit rounded-full bg-teal-50 px-3 py-2 text-xs font-black text-teal-700">
          {authContext.profile?.email ?? "Google 로그인이 필요합니다"} {activeRole ? `· ${activeRole}` : ""}
        </span>
      </header>

      {authError ? (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
          Google 로그인 처리 실패: {authError}
        </div>
      ) : null}

      {authContext.state !== "active" ? <AccessGate authContext={authContext} /> : null}

      {authContext.state === "active" ? (
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-5 text-sm font-black text-slate-500" role="tablist" aria-label="Dashboard views">
          {tabs.filter((view) => canAccessView(authContext, view)).map((view) => (
            <button
              key={view}
              aria-selected={activeView === view}
              className={`bg-transparent pb-2 ${
                activeView === view ? "border-b-4 border-teal-600 text-teal-700" : "text-slate-500"
              }`}
              onClick={() => dispatch({ type: "select-view", view })}
              role="tab"
              type="button"
            >
              {viewLabel(view)}
            </button>
          ))}
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700" data-visible-view={activeView}>
          현재 View: {viewLabel(activeView)} visible
        </span>
      </div>
      ) : null}

      {authContext.state === "active" && state.toast ? (
        <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800" role="status">
          {state.toast}
        </div>
      ) : null}

      {authContext.state === "active" && activeView === "dashboard" ? (
        <section aria-labelledby="dashboard-view-title">
          <h2 className="mb-3 font-black" id="dashboard-view-title">
            Dashboard · 뮤지컬 넘버
          </h2>
          <DashboardCards dispatch={dispatch} playingTargetId={state.playingTargetId} selectedNumberId={state.selectedNumberId} />
          <FeedbackCards />
        </section>
      ) : null}

      {authContext.state === "active" && activeView === "work" ? (
        <section aria-labelledby="work-view-title">
          <h2 className="mb-3 font-black" id="work-view-title">
            Work · 내 배역 넘버 현황
          </h2>
          <WorkPanel availableRoles={authContext.profile?.roleNames} dispatch={dispatch} state={state} mode="work" />
        </section>
      ) : null}

      {authContext.state === "active" && activeView === "submit" ? (
        <section aria-labelledby="submit-view-title">
          <h2 className="mb-3 font-black" id="submit-view-title">
            Submit · 녹음 제출
          </h2>
          <WorkPanel availableRoles={authContext.profile?.roleNames} dispatch={dispatch} state={state} mode="submit" />
        </section>
      ) : null}

      {authContext.state === "active" && activeView === "drive" ? (
        <section aria-labelledby="drive-view-title">
          <h2 className="mb-3 font-black" id="drive-view-title">
            Google Drive · 제13회정기공연
          </h2>
          <GoogleDrivePanel dispatch={dispatch} state={state} />
        </section>
      ) : null}

      {authContext.state === "active" && activeView === "director" ? (
        <section aria-labelledby="director-view-title">
          <h2 className="mb-3 font-black" id="director-view-title">
            제출 현황
          </h2>
          <DirectorSubmissions dispatch={dispatch} openCommentsFor={state.openCommentsFor} playingTargetId={state.playingTargetId} />
        </section>
      ) : null}
    </AppShell>
  );
}

function AccessGate({ authContext }: { authContext: AuthContext }) {
  if (authContext.state === "pending") {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <h2 className="text-xl font-black">승인 대기</h2>
        <p className="mt-2 text-sm">Google 로그인은 완료됐지만 등록된 멤버 권한이 없습니다. 관리자에게 배역/권한 등록을 요청해주세요.</p>
      </section>
    );
  }

  if (authContext.state === "blocked") {
    return (
      <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900">
        <h2 className="text-xl font-black">접근 권한 없음</h2>
        <p className="mt-2 text-sm">이 Google 계정은 Musical Studio 접근이 차단되어 있습니다.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-black">Google 로그인이 필요합니다</h2>
      <p className="mt-2 text-sm text-slate-600">왼쪽 사이드바의 Google 로그인 버튼으로 접속하면 멤버 권한과 배역을 확인합니다.</p>
    </section>
  );
}
