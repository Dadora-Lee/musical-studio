# Work Align Practice Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `/work` with `docs/practice-studio-scene.html` while preserving existing MusicXML, MR/AR/score playback, recording, take, and feedback behavior.

**Architecture:** Keep the current `PracticeStudioLayout` state and audio/recording logic. Change the visual shell to the approved scene structure: topbar, compact number list, central A4 score workspace, lower transport, and right take/feedback panel. Keep `ScoreViewer` responsible for OSMD rendering and A4 page normalization.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS, OSMD, Vitest/React Testing Library.

---

### Task 1: Lock layout contract in tests

**Files:**
- Modify: `tests/unit/components/practice/PracticeStudio.test.tsx`

- [ ] Add assertions for the approved shell landmarks: `Practice Studio`, `Number List`, `MusicXML Viewer`, `Transport`, `Recording Submissions`.
- [ ] Keep existing behavior assertions for pagination, MR/AR/score playback, recording tracks, and submitted-take feedback.
- [ ] Run `pnpm test -- tests/unit/components/practice/PracticeStudio.test.tsx` and confirm the old layout fails or the new contract is covered.

### Task 2: Apply scene-based `/work` layout

**Files:**
- Modify: `src/components/practice/PracticeStudioLayout.tsx`

- [ ] Replace the outer card layout with a scene-style app shell: fixed topbar, left compact list, center workspace, right side panel.
- [ ] Keep active state, member selector placeholder, score pager, `ScoreViewer`, `PracticeTransport`, takes, and feedback state intact.
- [ ] Move device selection into a collapsed details panel inside transport.
- [ ] Keep feedback hidden until a submitted recording is selected.

### Task 3: Stabilize A4 score framing

**Files:**
- Modify: `src/components/score/ScoreViewer.tsx`

- [ ] Keep A4 portrait ratio in the central viewer.
- [ ] Use vertical scroll with fixed page spacing.
- [ ] Avoid dynamic resizing that changes surrounding layout after render.

### Task 4: Verification and feedback loop

**Files:**
- Read-only unless a verification failure identifies a focused fix.

- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test -- tests/unit/components/practice/PracticeStudio.test.tsx`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm lint`.
- [ ] Open `/work` in the browser and verify the visual shell still has left list, center A4 score, lower transport, and right feedback panel.
- [ ] If any check fails, identify the root cause, fix only that cause, and rerun the relevant verification.
