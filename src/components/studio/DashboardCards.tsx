"use client";

import { Play } from "lucide-react";
import type { Dispatch } from "react";
import type { InteractionAction } from "@/lib/domain/interaction-state";
import { formatDuration, getDashboardNumbers } from "@/lib/domain/mvp-program";

export function DashboardCards({
  dispatch,
  playingTargetId,
  selectedNumberId
}: {
  dispatch?: Dispatch<InteractionAction>;
  playingTargetId?: string | null;
  selectedNumberId?: string;
}) {
  const cards = getDashboardNumbers();

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.id}
          className={`overflow-hidden rounded-lg border bg-white ${
            selectedNumberId === card.id ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200"
          }`}
        >
          <div className="flex h-24 items-end bg-gradient-to-br from-slate-700 to-teal-600 p-3 text-white">
            <strong>{card.category}</strong>
          </div>
          <div className="p-3">
            <button
              className="text-left font-black"
              onClick={() => dispatch?.({ type: "select-number", numberId: card.id })}
              type="button"
            >
              {card.title}
            </button>
            <p className="mt-1 text-xs text-slate-600">{card.playbackLabel} · MR + 대표 보컬</p>
            <div className="mt-3 grid grid-cols-[34px_1fr_48px] items-center gap-2">
              <button
                aria-label={`${card.title} 재생`}
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                  playingTargetId === card.id ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300"
                }`}
                onClick={() => dispatch?.({ type: "toggle-playback", targetId: card.id })}
                type="button"
              >
                {playingTargetId === card.id ? "정지" : <Play className="h-4 w-4" aria-hidden />}
              </button>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-teal-600" style={{ width: `${playingTargetId === card.id ? 100 : card.progressPercent}%` }} />
              </div>
              <span className="text-xs text-slate-600">{formatDuration(card.durationSec)}</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
