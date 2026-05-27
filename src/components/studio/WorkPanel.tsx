"use client";

import { ChevronLeft, ChevronRight, Mic, Play } from "lucide-react";
import type { Dispatch, ReactNode } from "react";
import type { InteractionAction, InteractionState } from "@/lib/domain/interaction-state";
import { getWorkItemsForRole, type RoleName } from "@/lib/domain/mvp-program";

type WorkPanelMode = "all" | "work" | "submit";

export function WorkPanel({
  availableRoles,
  dispatch,
  mode = "all",
  state
}: {
  availableRoles?: RoleName[];
  dispatch?: Dispatch<InteractionAction>;
  mode?: WorkPanelMode;
  state?: InteractionState;
}) {
  const roleOptions = availableRoles && availableRoles.length > 0 ? availableRoles : (["Hikaru", "Se-hun", "Ensemble"] as RoleName[]);
  const selectedRole = roleOptions.includes(state?.selectedRole ?? "Hikaru") ? (state?.selectedRole ?? "Hikaru") : roleOptions[0];
  const selectedNumberId = state?.selectedNumberId ?? "number-duet-night";
  const workItems = getWorkItemsForRole(selectedRole);
  const takes = state?.practiceTakes ?? [];
  const scorePage = state?.scorePage ?? 1;
  const scorePageCount = state?.scorePageCount ?? 6;
  const recordingState = state?.recordingState ?? "idle";
  const submissionStatus = state?.submissionStatus ?? "not_submitted";
  const selectedWork = workItems.find((item) => item.numberId === selectedNumberId) ?? workItems[0];
  const showWork = mode === "all" || mode === "work";
  const showSubmit = mode === "all" || mode === "submit";
  const gridClass =
    mode === "work"
      ? "grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)]"
      : mode === "submit"
        ? "grid gap-3 xl:grid-cols-[minmax(320px,520px)]"
        : "grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_330px]";

  return (
    <section className={gridClass} id="work-section">
      {showWork ? (
        <>
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 p-3">
              <h2 className="font-black">{selectedRole} 작업 목록</h2>
              <span className="text-xs text-slate-500">Week 1</span>
            </div>
            <div className="grid gap-2 p-3">
              {workItems.map((item) => (
                <button
                  key={item.numberId}
                  className={`rounded-md border p-3 text-left ${
                    item.numberId === selectedNumberId ? "border-teal-600 bg-teal-50" : "border-slate-200"
                  }`}
                  onClick={() => dispatch?.({ type: "select-number", numberId: item.numberId })}
                  type="button"
                >
                  <strong className="text-sm">{item.numberTitle}</strong>
                  <p className="mt-1 text-xs text-slate-600">
                    {item.category} · 마감 {item.dueDate.slice(5)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge tone="green">녹음 {item.recordingCount}</Badge>
                    <Badge tone="blue">WAV</Badge>
                    <Badge tone={item.submissionStatus === "submitted" ? "green" : "rose"}>
                      {statusLabel(item.submissionStatus)}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 p-3">
              <h2 className="font-black">악보 보기</h2>
              <span className="text-xs text-slate-500">
                Page {scorePage} / {scorePageCount} · Drive musicxml
              </span>
            </div>
            <div className="p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {roleOptions.map((role) => (
                  <button key={role} onClick={() => dispatch?.({ type: "select-role", role })} type="button">
                    <Badge tone={selectedRole === role ? "teal" : "slate"}>{role === roleOptions[0] ? `내 배역 ${role}` : role}</Badge>
                  </button>
                ))}
                <Badge>전체</Badge>
              </div>
              <div className="grid min-h-[430px] grid-cols-[36px_1fr_36px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-100 p-3">
                <button
                  className="flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white"
                  onClick={() => dispatch?.({ type: "change-score-page", direction: "previous" })}
                  type="button"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <div className="mx-auto flex aspect-[210/297] w-full max-w-[330px] flex-col overflow-hidden rounded-sm bg-white p-5 shadow-lg">
                  <div className="mb-3 text-center">
                    <strong className="block text-sm">{selectedWork?.numberTitle ?? "빛나는 밤의 약속"}</strong>
                    <span className="text-[10px] font-bold text-slate-500">
                      {selectedRole} Vocal · Page {scorePage}
                    </span>
                  </div>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="mb-3">
                      <div className="h-8 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_4px,#334155_5px,transparent_6px)]" />
                      {index < 3 ? <div className="mt-1 h-2 w-2/3 rounded bg-slate-200" /> : null}
                    </div>
                  ))}
                  <div className="mt-auto border-t border-slate-200 pt-1 text-right text-[10px] text-slate-500">{scorePage}</div>
                </div>
                <button
                  className="flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white"
                  onClick={() => dispatch?.({ type: "change-score-page", direction: "next" })}
                  type="button"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {showSubmit ? (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 p-3">
            <h2 className="font-black">녹음 · 제출</h2>
            <span className="text-xs text-slate-500">sync source: WAV</span>
          </div>
          <div className="grid gap-3 p-3" id="submit-section">
            <div className="grid grid-cols-[36px_1fr_58px] items-center gap-2 rounded-md bg-slate-100 p-2">
              <button
                className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                  state?.playingTargetId === "work-player" ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 bg-white"
                }`}
                onClick={() => dispatch?.({ type: "toggle-playback", targetId: "work-player" })}
                type="button"
              >
                {state?.playingTargetId === "work-player" ? "정지" : <Play className="h-4 w-4" aria-hidden />}
              </button>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-full w-2/5 rounded-full bg-teal-600" />
              </div>
              <span className="text-xs text-slate-600">01:24</span>
            </div>
            <div
              className={`flex items-center gap-2 rounded-md border border-teal-200 p-2 text-xs font-black text-slate-700 ${
                recordingState === "recording"
                  ? "animate-pulse bg-gradient-to-r from-teal-600 via-teal-300 to-amber-200"
                  : "bg-gradient-to-r from-teal-600 via-teal-300 to-slate-100"
              }`}
            >
              <Mic className="h-4 w-4" aria-hidden />
              {recordingState === "recording" ? "recording · mic input live" : "mic input live"}
            </div>
            <div className="h-16 rounded-md border border-teal-200 bg-[repeating-linear-gradient(90deg,#dff5f2_0_8px,#8bd8cc_8px_11px,#dff5f2_11px_20px)]" />
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-md bg-teal-700 px-3 py-2 text-xs font-black text-white"
                onClick={() => dispatch?.({ type: "start-recording" })}
                type="button"
              >
                녹음 시작
              </button>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black"
                onClick={() => dispatch?.({ type: "stop-recording" })}
                type="button"
              >
                정지
              </button>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black"
                onClick={() => dispatch?.({ type: "toggle-playback", targetId: "latest-take-preview" })}
                type="button"
              >
                다시 듣기
              </button>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-black">연습 내용</h3>
              <Badge tone={submissionStatus === "submitted" ? "green" : "rose"}>{statusLabel(submissionStatus)}</Badge>
            </div>
            {takes.map((take, index) => (
              <div key={take.id} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border border-slate-200 p-2">
                <div>
                  <strong className="text-sm">{take.fileName}</strong>
                  <p className="text-xs text-slate-600">
                    {take.createdAt} · {take.durationSec}s · {take.note ?? "sync source"}
                  </p>
                </div>
                <button
                  className={`rounded-md px-3 py-2 text-xs font-black ${
                    index === 0 ? "border border-orange-300 bg-orange-50 text-orange-800" : "border border-slate-300"
                  }`}
                  onClick={() =>
                    index === 0
                      ? dispatch?.({ type: "submit-latest-take" })
                      : dispatch?.({ type: "toggle-playback", targetId: take.id })
                  }
                  type="button"
                >
                  {index === 0 ? "제출" : "재생"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Badge({
  children,
  tone = "slate"
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "blue" | "rose" | "teal";
}) {
  const toneClass = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
    teal: "bg-teal-50 text-teal-700"
  }[tone];

  return <span className={`rounded-full px-2 py-1 text-[11px] font-black ${toneClass}`}>{children}</span>;
}

function statusLabel(status: string) {
  if (status === "submitted") return "제출 완료";
  if (status === "not_recorded") return "녹음 없음";
  return "미제출";
}
