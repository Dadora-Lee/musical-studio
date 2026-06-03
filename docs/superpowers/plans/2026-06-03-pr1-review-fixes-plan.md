# PR #1 Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PR #1 `codex/local-db-prototype` 리뷰에서 merge-blocking으로 지정된 high/medium 항목을 기술적으로 검증하고, 안전한 순서로 수정해 Draft PR을 Ready 전환 가능한 상태로 만든다.

**Architecture:** 먼저 사용자 핵심 흐름을 깨는 런타임 결함인 Recording WAV 변환과 MusicXML playback timing을 고친다. 그 다음 테스트 공백을 보강하고, DB/Auth/env/asset route 같은 운영 안전성 항목은 프로젝트 규칙상 별도 승인 게이트를 거쳐 분리 적용한다.

**Tech Stack:** Next.js App Router, React, TypeScript, MediaRecorder, Web Audio API, MusicXML parser, Vitest, Testing Library, Playwright Chromium, Supabase SQL migrations.

---

## Current State

- 대상 repo: `/home/jieun/projects/musical-studio`
- 대상 브랜치: `codex/local-db-prototype`
- 현재 HEAD: `ba7c068 feat(work): stabilize recording poc flow`
- PR: `https://github.com/Dadora-Lee/musical-studio/pull/1`
- PR 상태: Draft / Open / `REVIEW_REQUIRED`
- 작업 트리: clean, `origin/codex/local-db-prototype`와 동기화
- `origin/main`: `9577fe6 docs(handoff): record codex ultracode re-review + Draft PRs #1/#2 collab`

## Review Items Triage

### Merge-blocking High

1. **REC-WEBM 무음 저장**
   - File: `src/components/practice/PracticeStudioLayout.tsx`
   - Risk: Chrome/Edge/Firefox 기본 MediaRecorder output이 `audio/webm`인 경우 저장 take가 무음 WAV로 대체될 수 있음.
   - Required outcome: decode 가능한 blob은 실제 PCM 기반 WAV로 변환한다. decode 실패 시 무음으로 성공 처리하지 않고 사용자에게 명시적 error를 보여준다.

2. **MXML backup/forward 미처리**
   - File: `src/lib/musicxml/playback-events.ts`
   - Risk: 다성부, grand-staff, `<backup>`, `<forward>`가 있는 MusicXML에서 playback timing이 틀어짐.
   - Required outcome: measure child node를 문서순으로 순회하고, cursor를 `<backup>`/`<forward>`로 가감하며, measure duration은 voice end max로 계산한다.

### Medium, but useful in same review cycle

3. **Playback/recording test gaps**
   - Files:
     - `tests/unit/lib/musicxml/playback-events.test.ts`
     - `tests/unit/components/practice/PracticeStudio.test.tsx`
   - Required outcome: high bug를 실제로 잡는 회귀 테스트를 추가한다.

4. **REC-UNMOUNT race**
   - File: `src/components/practice/PracticeStudioLayout.tsx`
   - Required outcome: unmount cleanup 중 recorder `onstop`이 뒤늦게 finalize를 호출하지 않게 막는다.

### Medium requiring separate approval before implementation

5. **MIG RLS/history**
   - File: `supabase/migrations/20260527000000_initial_schema.sql`
   - Reason for gate: DB schema/migration/RLS 변경은 프로젝트 규칙상 사용자 승인 필요.
   - Proposed handling: 별도 DB migration plan 작성 후 승인받고 진행.

6. **ASSET-ROUTE authentication**
   - File: `src/app/api/prototype-assets/[numberId]/[kind]/route.ts`
   - Reason for gate: Auth policy/public asset access 정책 결정 필요.
   - Proposed handling: prototype-only route 유지 vs authenticated route 전환 중 선택 필요.

7. **`/mnt/e` hardcoded owner path**
   - File: `src/lib/musicxml/prototype-source.server.ts`
   - Reason for gate: env var 추가 여부 또는 fixture commit 여부 결정 필요. MusicXML/MR/AR 실제 파일 commit 금지.
   - Proposed handling: env 기반 root path + missing fallback. env 추가는 승인 필요.

8. **sync-env dotenv escaping**
   - Files:
     - `scripts/sync-env.sh`
     - `tests/unit/scripts/sync-env.test.ts`
   - Reason for gate: env tooling behavior 변경. 단, secret 값 자체는 수정 금지.
   - Proposed handling: 별도 small fix 가능. 변경 전 영향 범위 확인 필요.


## Review Recheck Corrections

2026-06-03 재검토 결과, 계획의 방향은 유지하되 실행 전에 아래 보정사항을 반드시 반영한다.

1. **REC-WEBM non-silent 테스트는 현재 전역 `Blob.prototype.arrayBuffer` mock과 충돌한다.** 최종 저장 WAV blob을 실제로 검사하려면 `Blob.prototype.arrayBuffer`를 전역으로 고정하지 말고 native `Blob.arrayBuffer()`를 유지하거나, 입력 blob에만 개별 spy를 걸어야 한다. `readWavPcmSamples()`는 실제 `audioBufferToWav()`가 만든 blob을 읽어야 한다.
2. **`transcodeRecordingToWav` signature 정리도 포함한다.** webm 무음 fallback 제거 후 `durationSeconds` 인자가 불필요하면 함수와 `finalizeRecording()` 호출부를 함께 갱신한다.
3. **REC-UNMOUNT 테스트는 stream track stop과 MediaRecorder stop을 구분한다.** 현재 `mocks.stop`은 stream track stop mock이므로, recorder stop까지 검증하려면 `FakeMediaRecorder` instance 또는 `recorderStop` spy를 별도로 노출한다.
4. **MusicXML parser 수정 시 rest/chord 기존 동작을 보존한다.** rest는 event를 만들지 않지만 cursor는 전진해야 하고, chord는 직전 note start를 유지해야 한다. `backup`/`forward` 때문에 child index가 흔들리므로 event id는 DOM child index 대신 note event counter로 안정화한다.
5. **tie 테스트는 high blocker 범위와 분리한다.** 이번 high fix의 핵심은 `backup`/`forward` timing이다. tie는 최소한 “tie stop note를 재타격하지 않는다” 정도만 회귀 테스트하고, tied note sustain duration 병합은 별도 후속 작업으로 명시한다.

## Recommended Execution Order

1. REC-WEBM fix + non-silent WAV tests.
2. MXML backup/forward fix + multi-voice/tie/forward tests.
3. REC-UNMOUNT cleanup fix.
4. Full verification.
5. PR #1에 high blocker resolved comment 작성.
6. 사용자에게 medium infra 항목을 선택지로 확인.
7. 승인받은 medium 항목만 별도 commit으로 처리.

---


## Completion Criteria Recheck

완료 판단은 아래 4단계 증거가 모두 있을 때만 한다.

1. **High blocker evidence**
   - REC-WEBM: Chrome 계열 `audio/webm` recording blob이 decode-first 경로를 타고, 저장된 WAV PCM sample에 non-zero 값이 있음을 unit test로 검증한다.
   - REC-WEBM failure: decode 실패/timeout 시 local take가 생성되지 않고 사용자 error가 표시됨을 unit test로 검증한다.
   - MXML backup/forward: multi-voice fixture에서 두 voice가 같은 startSeconds를 가질 수 있고, measure duration이 voice end max로 계산됨을 unit test로 검증한다.

2. **Regression safety evidence**
   - unmount 중 active recorder가 finalize/save를 호출하지 않음을 unit test로 검증한다.
   - rest cursor advance, chord same-start, tie stop duplicate skip이 기존/신규 parser tests로 보존된다.
   - 기존 `/work` UI 위치는 변경하지 않았음을 result HTML에 스크린샷 또는 체크리스트로 남긴다.

3. **Verification evidence**
   - `pnpm lint`, `pnpm typecheck`, `pnpm test` 결과를 result HTML에 명령어와 함께 기록한다.
   - Recording/Piano Chromium E2E 결과를 result HTML에 기록한다. 환경 문제로 실패하면 실패 로그와 대체 수동 검증 결과를 분리해서 적고, pass로 주장하지 않는다.

4. **PR readiness evidence**
   - 고친 리뷰 항목은 PR inline thread에 각각 답변한다.
   - approval-gated 항목은 구현/보류/별도 PR 중 하나로 사용자 결정이 남아 있어야 한다.
   - 원격 `origin/codex/local-db-prototype`에 push되어 있고, 작업 트리에 의도하지 않은 파일이 남아 있지 않아야 한다.

## Approval Gate Detail

아래 항목은 high blocker 수정을 완료해도 자동으로 구현하지 않는다. 각 항목은 별도 HTML/ADR 제안서와 사용자 승인 후 진행한다.

| Gate | 승인 전 금지 | 승인 문서 | 사용자 선택지 | 기본값 |
| --- | --- | --- | --- | --- |
| DB migration/RLS | `supabase/migrations/*` 수정, RLS 정책 추가/삭제 | `docs/adr/YYYY-MM-DD-local-prototype-migration-strategy.md` | prototype-only 유지 / 신규 RLS migration / schema 재정렬 | 보류 |
| Asset route auth | `src/app/api/prototype-assets/*` 인증 정책 변경 | `docs/ui-change-proposals/YYYY-MM-DD-work-prototype-assets-security-plan.html` | dev-only 차단 / Supabase auth / Storage 전환까지 보류 | 보류 |
| `/mnt/e` path/env | env var 추가, path fallback 정책 변경 | asset security/path 제안서에 포함 | env root path / fixture fallback / 현상 유지 | 보류 |
| sync-env escaping | `scripts/sync-env.sh` 동작 변경 | small fix 제안 또는 result 문서 내 승인 섹션 | 지금 수정 / 별도 PR / 현상 유지 | 별도 확인 |
## Task 1: REC-WEBM regression test first

**Files:**
- Modify: `tests/unit/components/practice/PracticeStudio.test.tsx`
- Modify: `src/components/practice/PracticeStudioLayout.tsx`

- [ ] **Step 1: Add a non-silent AudioBuffer mock**

In `installRecorderMocks()`, keep the current `decodeAudioData` mock but ensure it returns non-zero samples. Also remove or narrow the current global `Blob.prototype.arrayBuffer` mock so the final saved WAV blob can be inspected with its real `arrayBuffer()` implementation:

```ts
const decodeAudioData = vi.fn().mockResolvedValue({
  numberOfChannels: 1,
  sampleRate: 44100,
  length: 4,
  getChannelData: () => new Float32Array([0, 0.35, -0.25, 0.12]),
});
```

- [ ] **Step 2: Capture the saved WAV blob**

Add a test that records, stops, saves, and inspects the blob passed to `URL.createObjectURL`. This test must read the actual WAV blob returned by `audioBufferToWav()`, not the globally mocked `Blob.prototype.arrayBuffer`:

```ts
function readWavPcmSamples(blob: Blob) {
  return blob.arrayBuffer().then((buffer) => {
    const view = new DataView(buffer);
    const samples: number[] = [];
    for (let offset = 44; offset < view.byteLength; offset += 2) {
      samples.push(view.getInt16(offset, true));
    }
    return samples;
  });
}

it('saves decoded recording audio as a non-silent WAV', async () => {
  const user = userEvent.setup();
  const mocks = installRecorderMocks();

  render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

  await waitFor(() => expect(screen.getByLabelText('녹음 시작')).toBeEnabled());
  await user.click(screen.getByLabelText('녹음 시작'));
  await user.click(screen.getByLabelText('녹음 정지'));

  await waitFor(() => expect(mocks.createObjectURL).toHaveBeenCalledWith(expect.any(Blob)));
  const wavBlob = mocks.createObjectURL.mock.calls.at(-1)?.[0] as Blob;
  const samples = await readWavPcmSamples(wavBlob);

  expect(wavBlob.type).toBe('audio/wav');
  expect(samples.some((sample) => sample !== 0)).toBe(true);
});
```

- [ ] **Step 3: Run the targeted test and verify it fails before implementation**

Run:

```bash
pnpm test tests/unit/components/practice/PracticeStudio.test.tsx
```

Expected before fix: the new non-silent assertion fails because webm currently falls back to silent WAV.

- [ ] **Step 4: Remove unconditional webm silent fallback**

Replace the current `transcodeRecordingToWav` behavior with decode-first logic:

```ts
async function transcodeRecordingToWav(blob: Blob) {
  return withPromiseTimeout(transcodeToWav(blob), 4000, 'WAV 변환 시간이 초과되었습니다.');
}
```

- [ ] **Step 5: Show explicit error on decode failure**

Keep `finalizeRecording()` catch path as error, but change copy so the user knows save did not happen:

```ts
setRecorderState('error');
setRecorderMessage(`녹음 파일을 WAV로 변환하지 못했습니다. 다시 녹음해주세요: ${message}`);
```

- [ ] **Step 6: Verify targeted test passes**

Run:

```bash
pnpm test tests/unit/components/practice/PracticeStudio.test.tsx
```

Expected: all PracticeStudio tests pass.

## Task 2: REC-UNMOUNT cleanup race

**Files:**
- Modify: `src/components/practice/PracticeStudioLayout.tsx`
- Modify: `tests/unit/components/practice/PracticeStudio.test.tsx`

- [ ] **Step 1: Add unmount-while-recording test**

```ts
it('does not finalize a recording after unmount while recorder is active', async () => {
  const user = userEvent.setup();
  const mocks = installRecorderMocks();

  const { unmount } = render(<PracticeStudioLayout data={practiceStudioPrototype} score={<div>Score preview</div>} />);

  await waitFor(() => expect(screen.getByLabelText('녹음 시작')).toBeEnabled());
  await user.click(screen.getByLabelText('녹음 시작'));

  unmount();

  expect(mocks.stop).toHaveBeenCalled(); // stream track cleanup
  expect(mocks.recorderStop).toHaveBeenCalled(); // expose separately from FakeMediaRecorder
  expect(mocks.createObjectURL).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Add cleanup helper in `PracticeTransport`**

```ts
function cleanupRecorder() {
  const recorder = recorderRef.current;
  recordingFinalizedRef.current = true;
  clearFinalizeTimer();
  clearRecordingTimer();
  if (recorder && recorder.state !== 'inactive') {
    recorder.ondataavailable = null;
    recorder.onstop = null;
    recorder.stop();
  }
  recorderRef.current = null;
  stopStream();
}
```

- [ ] **Step 3: Use cleanup helper in unmount effect**

```ts
useEffect(() => {
  return () => {
    cleanupRecorder();
    if (readyRecordingRef.current) window.URL.revokeObjectURL(readyRecordingRef.current.url);
  };
}, []);
```

- [ ] **Step 4: Verify targeted test passes**

Run:

```bash
pnpm test tests/unit/components/practice/PracticeStudio.test.tsx
```

Expected: all PracticeStudio tests pass.

## Task 3: MusicXML backup/forward parser tests

**Files:**
- Modify: `tests/unit/lib/musicxml/playback-events.test.ts`
- Modify: `src/lib/musicxml/playback-events.ts`

- [ ] **Step 1: Add backup/forward fixture**

Add a MusicXML fixture with two voices in one measure:

```xml
<measure number="1">
  <attributes><divisions>1</divisions></attributes>
  <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><voice>1</voice></note>
  <backup><duration>4</duration></backup>
  <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><voice>2</voice></note>
  <forward><duration>2</duration></forward>
</measure>
```

- [ ] **Step 2: Add assertion for simultaneous voice starts**

```ts
it('handles backup and forward cursors for multi-voice measures', () => {
  const map = parseMusicXmlPlaybackEvents(multiVoiceXml);

  const c4 = map.events.find((event) => event.midi === 60);
  const e3 = map.events.find((event) => event.midi === 52);

  expect(c4?.startSeconds).toBe(0);
  expect(e3?.startSeconds).toBe(0);
  expect(map.measures[0]?.durationSeconds).toBe(2);
});
```

- [ ] **Step 3: Add forward-only assertion**

```ts
it('moves the playback cursor forward for rests or skipped time', () => {
  const map = parseMusicXmlPlaybackEvents(forwardXml);

  expect(map.events[0]?.startSeconds).toBe(1);
});
```

- [ ] **Step 4: Run parser tests and verify failure before implementation**

Run:

```bash
pnpm test tests/unit/lib/musicxml/playback-events.test.ts
```

Expected before fix: backup/forward timing tests fail.

## Task 4: MusicXML backup/forward implementation

**Files:**
- Modify: `src/lib/musicxml/playback-events.ts`
- Test: `tests/unit/lib/musicxml/playback-events.test.ts`

- [ ] **Step 1: Replace `:scope > note` only traversal with child-node traversal**

Preserve the existing rest cursor advance and chord same-start behavior. Use a dedicated note event counter for stable event ids instead of raw DOM child index.

Implementation shape:

```ts
for (const child of Array.from(measure.children)) {
  if (child.tagName === 'backup') {
    partTime = Math.max(measureStartSeconds, partTime - durationToSeconds(readDuration(child), divisions, tempo));
    continue;
  }

  if (child.tagName === 'forward') {
    partTime += durationToSeconds(readDuration(child), divisions, tempo);
    measureEndSeconds = Math.max(measureEndSeconds, partTime);
    continue;
  }

  if (child.tagName !== 'note') continue;

  // existing note parse path here
}
```

- [ ] **Step 2: Track measure end as max cursor end**

```ts
measureEndSeconds = Math.max(measureEndSeconds, noteStartSeconds + durationSeconds);
```

- [ ] **Step 3: Set measure duration from max end**

```ts
const measureDurationSeconds = Math.max(0, measureEndSeconds - measureStartSeconds);
```

- [ ] **Step 4: Run parser tests**

Run:

```bash
pnpm test tests/unit/lib/musicxml/playback-events.test.ts
```

Expected: parser tests pass.

## Task 5: Tie handling test and minimal fix

**Files:**
- Modify: `tests/unit/lib/musicxml/playback-events.test.ts`
- Modify: `src/lib/musicxml/playback-events.ts`

- [ ] **Step 1: Add tie fixture**

```xml
<note>
  <pitch><step>C</step><octave>4</octave></pitch>
  <duration>1</duration>
  <tie type="start"/>
</note>
<note>
  <pitch><step>C</step><octave>4</octave></pitch>
  <duration>1</duration>
  <tie type="stop"/>
</note>
```

- [ ] **Step 2: Add assertion**

```ts
it('does not retrigger tied continuation notes', () => {
  const map = parseMusicXmlPlaybackEvents(tiedXml);

  expect(map.events).toHaveLength(1);
  expect(map.events[0]).toEqual(expect.objectContaining({ pitch: 'C4', startSeconds: 0 }));
});
```

- [ ] **Step 3: Implement minimal tie-stop skip**

If a note has `<tie type="stop">` and no `<tie type="start">`, skip creating a new event but still advance cursor. This prevents duplicate re-trigger only; full sustain-duration merge is intentionally deferred unless separately implemented and tested.

```ts
const hasTieStop = Array.from(note.getElementsByTagName('tie')).some((tie) => tie.getAttribute('type') === 'stop');
const hasTieStart = Array.from(note.getElementsByTagName('tie')).some((tie) => tie.getAttribute('type') === 'start');
if (hasTieStop && !hasTieStart) {
  partTime += durationSeconds;
  measureEndSeconds = Math.max(measureEndSeconds, partTime);
  continue;
}
```

- [ ] **Step 4: Verify parser tests**

Run:

```bash
pnpm test tests/unit/lib/musicxml/playback-events.test.ts
```

Expected: all playback event tests pass.

## Task 6: Asset route and hardcoded path decision gate

**Files:**
- Read: `src/app/api/prototype-assets/[numberId]/[kind]/route.ts`
- Read: `src/lib/musicxml/prototype-source.server.ts`
- Create: `docs/ui-change-proposals/YYYY-MM-DD-work-prototype-assets-security-plan.html`

- [ ] **Step 1: Do not implement immediately**

This touches Auth behavior and environment configuration. Ask the user to choose one:

- Option A: Keep route dev/prototype-only and add explicit production 404/disabled gate.
- Option B: Add Supabase authenticated route access.
- Option C: Keep as-is until Supabase Storage migration, but document non-mergeable risk.

- [ ] **Step 2: Prepare a before/after HTML proposal**

Required sections:

- Current route behavior
- Proposed route behavior
- What remains accessible in dev
- What is blocked in production
- Whether env var is needed
- Rollback criteria

- [ ] **Step 3: Only implement after user approval**

No code changes before approval.

## Task 7: DB migration/RLS decision gate

**Files:**
- Read: `supabase/migrations/20260527000000_initial_schema.sql`
- Create: `docs/adr/YYYY-MM-DD-local-prototype-migration-strategy.md`

- [ ] **Step 1: Do not edit migration yet**

This is a DB schema/RLS/migration change. Project rules require user approval.

- [ ] **Step 2: Prepare ADR proposal**

Options:

- Option A: Keep local prototype migration only, mark PR #1 not ready for cloud.
- Option B: Add new dated migration that creates prototype tables with RLS deny-by-default.
- Option C: Reconcile with original 7-table schema and add prototype seed separately.

- [ ] **Step 3: Ask user before implementation**

Required question:

> PR #1을 cloud-ready로 만들기 위해 RLS 포함 신규 migration을 지금 추가할까요, 아니면 prototype-only 상태로 남기고 별도 DB PR로 분리할까요?

## Task 8: sync-env dotenv escaping decision gate

**Files:**
- Read first: `scripts/sync-env.sh`
- Read first: `tests/unit/scripts/sync-env.test.ts`
- Modify only after user approval: `scripts/sync-env.sh`
- Modify only after user approval: `tests/unit/scripts/sync-env.test.ts`

- [ ] **Step 0: Confirm user approval before implementation**

This item was triaged as approval-gated env tooling behavior. Do not edit the script or tests until the user chooses now / separate PR / defer.

- [ ] **Step 1: Add failing test for quotes and dollar signs after approval**

```ts
it('emits dotenv-compatible quoted values for quotes and dollar signs', async () => {
  const value = "abc'def$ghi";
  const emitted = emitEnvLineForTest('NEXTAUTH_SECRET', value);

  expect(emitted).toBe('NEXTAUTH_SECRET="abc\'def\$ghi"');
});
```

Note: exact helper depends on current test harness. If no helper exists, invoke script against a temp secrets env and parse with `@next/env` if dependency exists.

- [ ] **Step 2: Implement dotenv-compatible escaping**

Preferred output form:

```bash
value="${value//\\/\\\\}"
value="${value//\"/\\\"}"
value="${value//\$/\\\$}"
printf '%s="%s"\n' "$key" "$value"
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm test tests/unit/scripts/sync-env.test.ts
```

Expected: sync-env tests pass.

## Task 9: Full verification and PR review response

**Files:**
- Create: `docs/ui-change-proposals/YYYY-MM-DD-pr1-review-fixes-result.html`

- [ ] **Step 1: Run required checks**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm exec playwright test tests/e2e/work-recording-stabilization.spec.ts --project=chromium
pnpm exec playwright test tests/e2e/work-piano-playback.spec.ts --project=chromium
```

Expected:

```text
lint: pass
typecheck: pass
unit tests: pass
recording e2e chromium: pass
piano e2e chromium: pass
```

- [ ] **Step 2: Write result HTML**

Include:

- Which review comments were fixed
- Which review comments were deferred and why
- Verification commands and results
- Remaining approval-gated decisions

- [ ] **Step 3: Commit in small chunks**

Suggested commits:

```bash
git add src/components/practice/PracticeStudioLayout.tsx tests/unit/components/practice/PracticeStudio.test.tsx
git commit -m "fix(work): preserve recorded audio in wav takes"

git add src/lib/musicxml/playback-events.ts tests/unit/lib/musicxml/playback-events.test.ts
git commit -m "fix(musicxml): handle backup and forward playback timing"

git add docs/ui-change-proposals/YYYY-MM-DD-pr1-review-fixes-result.html
git commit -m "docs(review): summarize pr1 review fixes"
```

Each commit body:

```text
Co-Authored-By: Codex CLI <codex@openai.local>
```

- [ ] **Step 4: Push**

```bash
git push origin codex/local-db-prototype
```

- [ ] **Step 5: Reply to PR review threads**

Use GitHub thread replies, not a top-level comment, for inline comments that were fixed.

## Acceptance Criteria

- REC-WEBM no longer saves decoded recordings as silent WAVs.
- WAV conversion failure blocks save and shows user-visible error.
- MusicXML parser handles `<backup>` and `<forward>` cursor movement.
- Multi-voice playback timing has regression tests.
- Tie continuation does not retrigger a duplicate note event.
- Recording cleanup prevents finalize-after-unmount race.
- All affected unit tests pass.
- Full `pnpm lint`, `pnpm typecheck`, `pnpm test` pass.
- Recording and piano Chromium E2E pass.
- Approval-gated DB/Auth/env/path items are not silently changed without user approval.

## Self-review Checklist

- No `.env*`, secret, MusicXML, MR, or AR asset files are committed.
- No `git add .` is used.
- No DB/Auth/RLS/env behavior changes are made without explicit approval.
- Existing agreed UI positions remain unchanged.
- Each fixed review item has a matching regression test.
- PR #1 remains Draft until high blockers are fixed and medium approval-gated items are decided.
