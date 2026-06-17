# Practice Studio Next Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/work` 화면에서 배우가 MusicXML 악보를 보고, MR/AR을 원하는 위치에서 재생하고, 녹음하고, 제출/Feedback 흐름까지 이해할 수 있는 prototype 상태를 만든다.

**Architecture:** 현재 UI 위치는 유지한다. 좌측 Number 목록, 상단 NickName, 중앙 MusicXML, 하단 Transport/Recording, 우측 제출/Feedback 구조를 그대로 두고 내부 동작과 검증만 안정화한다. DB schema와 Supabase 연동은 이번 작업에서 변경하지 않는다.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, OpenSheetMusicDisplay, HTMLAudio, MediaRecorder API, Vitest, React Testing Library, Playwright.

---

작성일: 2026-05-31  
기준 브랜치: `codex/local-db-prototype`  
기준 커밋: `53a3670`  
목표 화면: `http://localhost:3000/work`

## File Structure

- Modify: `src/components/score/ScoreViewer.tsx`
  - MusicXML title 유지, A4 fit, B형 균등 연습형 OSMD 렌더링 정책 적용.
- Modify: `src/components/practice/PracticeStudioLayout.tsx`
  - MR/AR 재생, seek, source 전환, Recording 상태 흐름 안정화.
- Modify: `tests/unit/components/practice/score-fixed-a4-pagination.test.ts`
  - B형 악보 정책, title 유지, A4 fit, print/new-system 제거 정책 검증.
- Modify: `tests/unit/components/practice/PracticeStudio.test.tsx`
  - MR/AR seek, source 전환, Recording start/pause/resume/stop/save 흐름 검증.
- Modify: `docs/ui-change-proposals/2026-05-31-current-progress-summary.html`
  - 구현 후 현재 상태 요약 갱신.
- Modify: `docs/ui-change-proposals/2026-05-31-git-branch-status-visualization.html`
  - 구현 후 브랜치/커밋 상태 갱신.
- Create: `docs/ui-change-proposals/2026-05-31-work-b-uniform-score-implementation.html`
  - B형 실제 적용 전/후, 검증 결과, 허용 편차 기록.
- Create or update screenshots under `docs/ui-change-proposals/`
  - Playwright 실제 화면 검증 이미지.

## Task 0: 시작 점검

**Files:**
- Read: `AGENTS.md`
- Read: `AGENTS.override.md`
- Read: `docs/ui-change-proposals/2026-05-31-current-progress-summary.html`
- Read: `docs/ui-change-proposals/2026-05-31-score-spacing-decision-b-uniform.html`
- Read: `docs/ui-change-proposals/2026-05-31-git-branch-status-visualization.html`

- [ ] **Step 0.1: WSL 레포와 브랜치 확인**

Run:

```bash
cd /home/jieun/projects/musical-studio
git branch --show-current
git rev-parse --short HEAD
git status --short --branch
```

Expected:

```text
codex/local-db-prototype
53a3670 또는 그 이후 커밋
작업 전 변경 사항을 설명할 수 있는 상태
```

- [ ] **Step 0.2: 프로젝트 룰 확인**

Run:

```bash
sed -n '1,220p' AGENTS.md
sed -n '1,220p' AGENTS.override.md
```

Expected:

```text
한국어 응답, UI 변경 전 HTML 문서, git add . 금지, 실제 MusicXML/MR/AR 미커밋 규칙 확인
```

## Task 1: B형 균등 연습형 변경 전/후 HTML 작성

**Files:**
- Create: `docs/ui-change-proposals/2026-05-31-work-b-uniform-score-implementation.html`

- [ ] **Step 1.1: 변경 전/후 HTML 작성**

HTML에 반드시 포함한다.

```text
변경 전:
- 현재 ScoreViewer는 compact OSMD 렌더링과 A4 fit을 사용한다.
- 한 줄 4마디 의도는 있으나, 마디 간격의 균등성은 Playwright 측정 문서에 명시적으로 남기지 않는다.

변경 후:
- B형 균등 연습형을 실제 /work MusicXML 렌더링 기준으로 적용한다.
- 목표는 한 줄 4마디, 페이지당 12~16마디, A4 fit, title 유지다.
- OSMD 한계로 완전 동일 폭을 보장하지 못하는 구간은 측정값으로 기록한다.

유지:
- 좌측 Number 목록
- 상단 NickName 선택
- 중앙 MusicXML 영역
- 하단 Transport/Recording
- 우측 제출/Feedback

되돌릴 기준:
- A4 영역에서 악보가 잘림
- title이 사라짐
- 좌측/우측/하단 주요 위치가 이동됨
- MR/AR/Recording 조작성이 퇴보함
```

- [ ] **Step 1.2: 사용자의 승인 기준 명시**

HTML 하단에 다음 문장을 넣는다.

```text
이 문서는 B형 실제 적용을 위한 변경 전/후 기록이다. 이미 B형 방향은 승인되었으므로, 구현 중 UI 주요 위치를 이동하지 않는 범위에서 진행한다.
```

## Task 2: B형 균등 연습형 TDD

**Files:**
- Modify: `tests/unit/components/practice/score-fixed-a4-pagination.test.ts`
- Modify: `src/components/score/ScoreViewer.tsx`

- [ ] **Step 2.1: 실패하는 테스트 작성**

`tests/unit/components/practice/score-fixed-a4-pagination.test.ts`에 다음 의도를 검증하는 테스트를 추가한다.

```ts
it('marks the rendered score as the B-type uniform practice layout', () => {
  expect(source).toContain('data-score-spacing');
  expect(source).toContain('uniform-practice');
  expect(source).toContain('data-score-measures-per-system');
  expect(source).toContain('4');
  expect(source).toContain('data-score-target-measures-per-page');
  expect(source).toContain('12-16');
});
```

- [ ] **Step 2.2: 실패 확인**

Run:

```bash
pnpm vitest run tests/unit/components/practice/score-fixed-a4-pagination.test.ts
```

Expected:

```text
FAIL: uniform-practice 관련 문자열이 아직 없어서 실패
```

- [ ] **Step 2.3: 최소 구현**

`src/components/score/ScoreViewer.tsx`에 B형 기준 상수를 추가한다.

```ts
const PRACTICE_MEASURES_PER_SYSTEM = 4;
const PRACTICE_TARGET_MEASURES_PER_PAGE = '12-16';
const PRACTICE_SCORE_SPACING = 'uniform-practice';
```

렌더링 완료 후 container와 page element에 metadata를 붙인다.

```ts
function markUniformPracticeScore(container: HTMLElement) {
  container.dataset.scoreSpacing = PRACTICE_SCORE_SPACING;
  container.dataset.scoreMeasuresPerSystem = String(PRACTICE_MEASURES_PER_SYSTEM);
  container.dataset.scoreTargetMeasuresPerPage = PRACTICE_TARGET_MEASURES_PER_PAGE;

  container.querySelectorAll<HTMLElement>('.osmd-page').forEach((page) => {
    page.dataset.scoreSpacing = PRACTICE_SCORE_SPACING;
    page.dataset.scoreMeasuresPerSystem = String(PRACTICE_MEASURES_PER_SYSTEM);
    page.dataset.scoreTargetMeasuresPerPage = PRACTICE_TARGET_MEASURES_PER_PAGE;
  });
}
```

`applyPracticeEngravingRules`에서 literal `4` 대신 상수를 사용한다.

```ts
rules.RenderXMeasuresPerLineAkaSystem = PRACTICE_MEASURES_PER_SYSTEM;
```

- [ ] **Step 2.4: 테스트 통과 확인**

Run:

```bash
pnpm vitest run tests/unit/components/practice/score-fixed-a4-pagination.test.ts
```

Expected:

```text
PASS
```

## Task 3: MR/AR 재생 UX 안정화

**Files:**
- Modify: `tests/unit/components/practice/PracticeStudio.test.tsx`
- Modify: `src/components/practice/PracticeStudioLayout.tsx`

- [ ] **Step 3.1: source 전환 안정성 테스트 추가**

`PracticeStudio.test.tsx`에 MR 재생 중 AR로 전환하면 이전 audio가 pause/reset되는지 검증한다.

```ts
it('pauses and resets the previous audio when switching playback sources', async () => {
  const user = userEvent.setup();
  render(<PracticeStudioLayout initialNumbers={numbers} initialMembers={members} />);

  fireEvent.loadedMetadata(screen.getByTestId('practice-audio'), {
    currentTarget: { duration: 180 },
  });

  await user.click(screen.getByRole('button', { name: '재생' }));
  await user.click(screen.getByRole('button', { name: 'AR' }));

  expect(screen.getByTestId('practice-audio')).toHaveAttribute('src', expect.stringContaining('ar'));
});
```

- [ ] **Step 3.2: MR/AR track fill 테스트 확인**

기존 MR seek 테스트와 AR seek 테스트가 둘 다 다음을 검증하는지 확인한다.

```text
- slider drag 후 current time이 변경된다.
- track fill이 MR/AR 모두 갱신된다.
- seek만으로 중복 play가 발생하지 않는다.
```

- [ ] **Step 3.3: 필요한 경우 최소 수정**

`PracticeStudioLayout.tsx`에서 source 변경 시 다음 규칙을 유지한다.

```text
- 이전 audio pause
- 이전 audio currentTime = 0
- 새 source duration metadata 로드 전 slider disabled
- seek commit에서만 실제 currentTime 확정
- paused audio에서는 seek 후 자동 play하지 않음
```

- [ ] **Step 3.4: 테스트 통과 확인**

Run:

```bash
pnpm vitest run tests/unit/components/practice/PracticeStudio.test.tsx
```

Expected:

```text
PASS
```

## Task 4: Recording 흐름 안정화

**Files:**
- Modify: `tests/unit/components/practice/PracticeStudio.test.tsx`
- Modify: `src/components/practice/PracticeStudioLayout.tsx`

- [ ] **Step 4.1: MediaRecorder mock 기반 테스트 작성**

검증할 흐름:

```text
1. 녹음 시작 클릭
2. getUserMedia 호출
3. 현재 선택된 MR/AR 재생
4. 녹음 일시정지 클릭
5. audio pause
6. 녹음 재개 클릭
7. audio play
8. 녹음 정지 클릭
9. WAV 변환 상태 메시지 표시
```

- [ ] **Step 4.2: 저장 흐름 테스트 작성**

검증할 흐름:

```text
1. 녹음 종료 후 저장 가능 상태가 된다.
2. 저장 클릭 시 우측 Take 목록에 local take가 추가된다.
3. 추가된 take를 클릭하면 Feedback 영역이 열린다.
```

- [ ] **Step 4.3: 최소 구현**

현재 코드가 이미 만족하면 구현을 변경하지 않는다. 실패하는 지점이 있으면 다음 범위 안에서만 수정한다.

```text
- recording status state
- media recorder event handler
- local object URL 생성/정리
- saveRecordingTake
- selectedTakeId 전환
```

- [ ] **Step 4.4: 테스트 통과 확인**

Run:

```bash
pnpm vitest run tests/unit/components/practice/PracticeStudio.test.tsx
```

Expected:

```text
PASS
```

## Task 5: 제출/Feedback 기준 문서화

**Files:**
- Modify: `docs/ui-change-proposals/2026-05-31-current-progress-summary.html`
- Modify: `docs/ui-change-proposals/2026-05-31-work-b-uniform-score-implementation.html`

- [ ] **Step 5.1: Feedback 기준 작성**

문서에 다음 정책을 넣는다.

```text
v1: 제출 take 전체에 대한 comment
v1.5: 특정 시간/comment timestamp
v2: 특정 마디 번호 + 시간 위치 연결
```

- [ ] **Step 5.2: DB 변경 없음 명시**

다음 문장을 넣는다.

```text
이번 단계에서는 DB schema와 Supabase migration을 변경하지 않는다. Feedback 위치 기준은 UI/문서 레벨에서만 정리한다.
```

## Task 6: Playwright 실제 화면 검증

**Files:**
- Create: `docs/ui-change-proposals/2026-05-31-work-b-uniform-score-verification.html`
- Create: `docs/ui-change-proposals/2026-05-31-work-b-uniform-score.png`

- [ ] **Step 6.1: dev server 실행**

Run:

```bash
pnpm dev
```

Expected:

```text
http://localhost:3000
```

- [ ] **Step 6.2: Playwright 검증**

검증 항목:

```text
- /work 진입 성공
- MusicXML SVG 렌더링
- title 표시
- A4 frame 안에서 악보가 잘리지 않음
- page count 정상
- 줄당 4마디 목표 적용 여부
- 페이지당 12~16마디 목표 적용 여부
- MR slider drag seek 정상
- AR slider drag seek 정상
- console에 play() request was interrupted 로그 없음
- Recording start/pause/resume/stop/save 흐름 확인
```

- [ ] **Step 6.3: 결과 문서화**

검증 결과 HTML에는 다음 표를 넣는다.

```text
항목 | 결과 | 근거
MusicXML SVG | PASS/FAIL | selector와 screenshot
Title | PASS/FAIL | 표시 텍스트
A4 fit | PASS/FAIL | bounding box
MR seek | PASS/FAIL | currentTime 변화
AR seek | PASS/FAIL | currentTime 변화
Recording | PASS/FAIL | 상태 메시지와 take 목록
Console error | PASS/FAIL | 수집 로그
```

## Task 7: 최종 문서 갱신

**Files:**
- Modify: `docs/ui-change-proposals/2026-05-31-current-progress-summary.html`
- Modify: `docs/ui-change-proposals/2026-05-31-git-branch-status-visualization.html`
- Modify: `docs/superpowers/plans/2026-05-31-practice-studio-next-workflow-prompt.md`
- Modify: `docs/ui-change-proposals/2026-05-31-practice-studio-next-workflow-prompt.html`

- [ ] **Step 7.1: 현재 진행 요약 갱신**

포함할 내용:

```text
- B형 균등 연습형 적용 여부
- MR/AR 재생 안정화 결과
- Recording 흐름 안정화 결과
- Feedback 기준
- 검증 명령 결과
- Playwright 결과 문서 링크
```

- [ ] **Step 7.2: git 상태 문서 갱신**

포함할 내용:

```text
- main 기준 차이
- 현재 브랜치 최신 커밋
- 원격 push 상태
- 다음 사람이 봐야 할 문서 목록
```

## Task 8: 최종 검증과 commit

**Files:**
- Stage only explicit changed files.

- [ ] **Step 8.1: 전체 검증**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Expected:

```text
PASS
```

- [ ] **Step 8.2: 변경 파일 확인**

Run:

```bash
git status --short
git diff --stat
```

Expected:

```text
실제 요청과 관련된 파일만 변경됨
실제 MusicXML/MR/AR 파일, .env, secret 파일 없음
```

- [ ] **Step 8.3: 명시 stage**

Run example:

```bash
git add src/components/score/ScoreViewer.tsx
git add src/components/practice/PracticeStudioLayout.tsx
git add tests/unit/components/practice/score-fixed-a4-pagination.test.ts
git add tests/unit/components/practice/PracticeStudio.test.tsx
git add docs/superpowers/plans/2026-05-31-practice-studio-next-workflow-prompt.md
git add docs/ui-change-proposals/2026-05-31-practice-studio-next-workflow-prompt.html
git add docs/ui-change-proposals/2026-05-31-work-b-uniform-score-implementation.html
git add docs/ui-change-proposals/2026-05-31-work-b-uniform-score-verification.html
git add docs/ui-change-proposals/2026-05-31-current-progress-summary.html
git add docs/ui-change-proposals/2026-05-31-git-branch-status-visualization.html
```

- [ ] **Step 8.4: commit**

Run:

```bash
git commit -m "feat(work): stabilize practice studio workflow"
```

Commit body:

```text
Apply B-type uniform practice score rendering, stabilize MR/AR and recording prototype flows, and update shared workflow documentation.

Co-Authored-By: Codex CLI <codex@openai.local>
```

## 목표 달성용 실행 프롬프트

```text
Musical Studio repository에서 다음 workflow를 목표 달성까지 진행해줘.

반드시 한국어로 응답해줘.
작업 전 AGENTS.md와 AGENTS.override.md를 확인해줘.
실제 작업 위치는 WSL repo /home/jieun/projects/musical-studio 이야.
기준 브랜치는 codex/local-db-prototype이고, 기준 커밋은 53a3670 이후야.

목표:
1. B형 균등 연습형 악보를 실제 /work MusicXML 렌더링에 적용한다.
2. MR/AR 재생 UX를 안정화한다.
3. Recording 시작-일시정지-재개-정지-저장 흐름을 안정화한다.
4. 제출/Feedback 위치 기준을 문서화한다.
5. 검증 결과와 공유 문서를 최신화한다.

진행 방식:
1. 현재 git 상태, AGENTS.md, AGENTS.override.md, 기존 진행 문서를 확인한다.
2. UI 변경 전 docs/ui-change-proposals/2026-05-31-work-b-uniform-score-implementation.html에 변경 전/후를 기록한다.
3. TDD로 B형 악보 적용 테스트를 먼저 작성하고 실패를 확인한다.
4. ScoreViewer에서 한 줄 4마디, 페이지당 12~16마디 목표, MusicXML title 유지, A4 fit을 적용한다.
5. MR/AR play/pause/stop/10초 이동/slider drag seek/source 전환을 검증하고 필요한 버그를 수정한다.
6. Recording start/pause/resume/stop/save 흐름을 unit test와 실제 화면 검증으로 안정화한다.
7. Feedback 기준은 v1=take 전체 comment, v1.5=시간 위치, v2=마디+시간 위치로 문서화한다.
8. DB schema, Supabase migration, 새 dependency는 변경하지 않는다.
9. current-progress-summary.html, git-branch-status-visualization.html, B형 검증 문서를 최신화한다.
10. pnpm lint, pnpm typecheck, pnpm test를 실행하고 결과를 기록한다.
11. git add . 없이 필요한 파일만 stage하고 Conventional Commit + Co-Authored-By trailer로 commit한다.

성공 기준:
- /work에서 B형 균등 연습형 악보가 적용되어 보인다.
- MusicXML title이 유지된다.
- A4 안에서 악보가 잘리지 않는다.
- MR/AR seek와 재생 상태가 일관된다.
- 녹음 시작부터 저장까지 prototype 흐름이 끊기지 않는다.
- 모든 테스트와 Playwright 검증이 통과한다.
- 공유용 HTML 문서가 최신 상태를 설명한다.
```

## Self-Review

- Spec coverage: 상단 계획서의 5개 Summary 항목을 Task 1~8에 모두 연결했다.
- Placeholder scan: `TBD`, `TODO`, `나중에 작성` 같은 빈 항목은 남기지 않았다.
- Type consistency: 파일 경로와 테스트 대상 컴포넌트 이름을 현재 레포 구조 기준으로 맞췄다.
