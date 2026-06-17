"use client";

import type { Dispatch, ReactNode } from "react";
import type { InteractionAction } from "@/lib/domain/interaction-state";
import { getDirectorSubmissionRows } from "@/lib/domain/mvp-program";

export function DirectorSubmissions({
  dispatch,
  openCommentsFor,
  playingTargetId
}: {
  dispatch?: Dispatch<InteractionAction>;
  openCommentsFor?: string | null;
  playingTargetId?: string | null;
}) {
  const rows = getDirectorSubmissionRows("assignment-week1-duet");

  return (
    <section className="rounded-lg border border-slate-200 bg-white" id="director-section">
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <h2 className="font-black">연출가 제출 현황 · Week 1</h2>
        <span className="text-xs text-slate-500">dense table</span>
      </div>
      <div className="p-3">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="border-b border-slate-200 p-2">부원</th>
              <th className="border-b border-slate-200 p-2">배역</th>
              <th className="border-b border-slate-200 p-2">넘버</th>
              <th className="border-b border-slate-200 p-2">상태</th>
              <th className="border-b border-slate-200 p-2">파일</th>
              <th className="border-b border-slate-200 p-2">액션</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const targetId = row.fileName ?? row.memberName;

              return (
                <tr key={`${row.memberName}-${row.roleName}`}>
                  <td className="border-b border-slate-200 p-2 font-bold">{row.memberName}</td>
                  <td className="border-b border-slate-200 p-2">{row.roleName}</td>
                  <td className="border-b border-slate-200 p-2">{row.numberTitle}</td>
                  <td
                    className={`border-b border-slate-200 p-2 font-black ${
                      row.status === "submitted" ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {row.status === "submitted" ? "제출" : "미제출"}
                  </td>
                  <td className="border-b border-slate-200 p-2">{row.fileName ?? "-"}</td>
                  <td className="border-b border-slate-200 p-2">
                    {row.status === "submitted" ? (
                      <div className="flex gap-1">
                        <button
                          className="rounded border border-slate-300 px-2 py-1 font-bold"
                          onClick={() => dispatch?.({ type: "toggle-playback", targetId })}
                          type="button"
                        >
                          {playingTargetId === targetId ? "정지" : "재생"}
                        </button>
                        <button
                          className="rounded border border-slate-300 px-2 py-1 font-bold"
                          onClick={() => dispatch?.({ type: "toggle-comments", recordingId: targetId })}
                          type="button"
                        >
                          Comment
                        </button>
                      </div>
                    ) : (
                      <button
                        className="rounded border border-slate-300 px-2 py-1 font-bold"
                        onClick={() => dispatch?.({ type: "remind-missing-member", memberName: row.memberName })}
                        type="button"
                      >
                        리마인드
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={`mt-3 grid gap-2 border-t border-slate-200 pt-3 ${openCommentsFor ? "" : "opacity-80"}`}>
          <h3 className="font-black">제출물 하위 Comment</h3>
          {openCommentsFor ? (
            <p className="text-xs font-bold text-blue-700">{openCommentsFor} 코멘트를 보고 있습니다.</p>
          ) : null}
          <Comment time="00:42">첫 진입 박자가 MR보다 조금 앞서요. 인트로까지 길게 가져가면 좋겠습니다.</Comment>
          <Comment time="01:36">상대 배역과 겹치는 구간이라 볼륨을 10% 정도 낮춰보세요.</Comment>
          <Comment time="02:11">이 부분은 대표본 후보로 괜찮습니다. 다음 녹음에서 발음만 더 또렷하게.</Comment>
        </div>
      </div>
    </section>
  );
}

function Comment({ time, children }: { time: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-sm">
      <span className="mr-2 font-black text-blue-700">{time}</span>
      {children}
    </div>
  );
}
