"use client";

import { useReducer } from "react";
import { DirectorSubmissions } from "./DirectorSubmissions";
import { GoogleDrivePanel } from "./GoogleDrivePanel";
import { WorkPanel } from "./WorkPanel";
import type { RoleName } from "@/lib/domain/mvp-program";
import {
  createInitialInteractionState,
  reduceInteraction,
  type DashboardView,
  viewLabel,
} from "@/lib/domain/interaction-state";

type WorkspaceView = Extract<DashboardView, "work" | "submit" | "drive" | "director"> | "comments";

export function WorkspaceSurface({
  availableRoles,
  view,
}: {
  availableRoles?: RoleName[];
  view: WorkspaceView;
}) {
  const initialView = view === "comments" ? "director" : view;
  const [state, dispatch] = useReducer(reduceInteraction, initialView, createInitialInteractionState);

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 md:flex-row md:items-center md:justify-between">
        <span className="w-fit rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
          ??? View: {view === "comments" ? "Comments" : viewLabel(initialView)}
        </span>
        {state.toast ? (
          <span className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800" role="status">
            {state.toast}
          </span>
        ) : null}
      </div>

      {view === "work" ? <WorkPanel availableRoles={availableRoles} dispatch={dispatch} mode="work" state={state} /> : null}
      {view === "submit" ? <WorkPanel availableRoles={availableRoles} dispatch={dispatch} mode="submit" state={state} /> : null}
      {view === "drive" ? <GoogleDrivePanel dispatch={dispatch} state={state} /> : null}
      {view === "director" || view === "comments" ? (
        <DirectorSubmissions dispatch={dispatch} openCommentsFor={state.openCommentsFor} playingTargetId={state.playingTargetId} />
      ) : null}
    </section>
  );
}
