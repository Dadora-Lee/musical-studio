# MusicXML Piano Playback Implementation Plan

> For agentic workers: use `superpowers:executing-plans` to implement this plan task-by-task.

작성일: 2026-05-31  
기준 브랜치: `codex/local-db-prototype`  
대상 화면: `http://localhost:3000/work`  
실제 WSL 레포: `/home/jieun/projects/musical-studio`

## 1. Goal

`/work` 화면에서 현재 소리 없이 cursor만 움직이는 `악보재생`을 실제 MusicXML 기반 `피아노 연주` prototype으로 전환한다. MusicXML note event를 파싱하고, 기존 dependency인 Tone.js로 피아노 계열 synth를 재생하며, 현재 연주 위치를 OSMD cursor/page와 동기화한다.

## 2. Scope

### 이번 단계에서 한다

- MusicXML raw string을 playback event map으로 변환한다.
- note, rest, chord, measure, 첫 tempo를 1차 범위로 처리한다.
- Tone.js wrapper를 만들어 UI 컴포넌트에서 Web Audio 세부 구현을 분리한다.
- `피아노 연주` source를 MR/AR와 같은 transport UX에 연결한다.
- play, pause, stop, 10초 전/후, slider seek를 지원한다.
- 현재 시간 기준 active measure를 찾아 OSMD cursor/page를 이동한다.
- 구현 전 UI 변경 전/후 HTML을 먼저 작성하고 승인받는다.

### 이번 단계에서 하지 않는다

- 새 npm dependency 추가
- 고품질 piano sample pack 추가
- DB schema, Supabase migration, Storage/Auth 변경
- 실제 MusicXML/MR/AR 파일 git 추가
- repeat, grace note, dynamic, pedal, 정교한 articulation 완전 지원
- Recording과 `피아노 연주` 동시 녹음 정책 확정

## 3. Architecture Decisions

- MusicXML 파싱은 `src/lib/musicxml/` 안에서만 처리한다.
- Tone.js 제어는 `src/lib/audio-engine/` wrapper로 분리한다.
- Tone.js는 client-only dynamic import로 로드한다.
- `Tone.start()`는 사용자 재생 gesture 안에서 호출한다.
- `ScoreViewer`와 piano parser는 같은 MusicXML raw string을 사용해야 한다.
- 1차 공유 방식은 `ScoreViewer`의 `onMusicXmlLoaded(rawXml)` callback을 추천한다.
- source, number, MusicXML raw string이 바뀌면 기존 player와 scheduler를 `dispose()`한다.

## 4. File Structure

- Create: `src/lib/musicxml/playback-events.ts`
- Create: `tests/unit/lib/musicxml/playback-events.test.ts`
- Create: `src/lib/audio-engine/musicxml-piano-player.ts`
- Create: `tests/unit/lib/audio-engine/musicxml-piano-player.test.ts`
- Modify: `src/components/score/ScoreViewer.tsx`
- Modify: `src/components/practice/PracticeStudioLayout.tsx`
- Modify: `tests/unit/components/practice/PracticeStudio.test.tsx`
- Create: `docs/ui-change-proposals/YYYY-MM-DD-work-piano-playback-before-after.html`
- Create: `docs/ui-change-proposals/YYYY-MM-DD-work-piano-playback-verification.html`

## 5. Playback Data Model

```ts
export interface MusicXmlPlaybackEvent {
  id: string;
  partId: string;
  measureNumber: number;
  startSeconds: number;
  durationSeconds: number;
  pitch: string;
  midi: number;
  isChord: boolean;
}

export interface MusicXmlPlaybackMap {
  tempoBpm: number;
  durationSeconds: number;
  events: MusicXmlPlaybackEvent[];
  measures: Array<{
    measureNumber: number;
    startSeconds: number;
    durationSeconds: number;
  }>;
}
```

1차 규칙:

- `<pitch>` + `<duration>` + `<divisions>`를 기반으로 note event를 만든다.
- `<rest>`는 시간만 진행하고 소리는 내지 않는다.
- `<chord/>`는 직전 note와 같은 `startSeconds`로 묶는다.
- tempo는 `<sound tempo="...">` 또는 `<per-minute>`를 우선 사용하고 없으면 120bpm으로 둔다.
- 1차 기본값은 전체 part 간단 병합 재생이다.
- 동시에 울리는 note 수와 전체 event 수에 guard를 둔다.

## 6. Implementation Workflow

### Task 0. 시작 점검

- [ ] WSL 레포와 브랜치를 확인한다.
- [ ] `AGENTS.md`와 `AGENTS.override.md`를 확인한다.
- [ ] `package.json`에 `tone`이 이미 있는지 확인한다.

### Task 1. UI 변경 전/후 HTML 작성

- [ ] `docs/ui-change-proposals/YYYY-MM-DD-work-piano-playback-before-after.html`을 만든다.
- [ ] 변경 전: `악보재생`은 소리 없는 cursor 이동 source임을 기록한다.
- [ ] 변경 후: `피아노 연주` source와 Tone.js 재생 흐름을 기록한다.
- [ ] 좌측 Number, 상단 NickName, 중앙 MusicXML, 하단 Transport/Recording, 우측 제출/Feedback 위치가 유지됨을 명시한다.

### Task 2. MusicXML playback event parser TDD

- [ ] 실패 테스트를 먼저 작성한다.
- [ ] note pitch와 midi 변환을 검증한다.
- [ ] rest가 event 없이 time만 진행하는지 검증한다.
- [ ] chord가 같은 `startSeconds`를 가지는지 검증한다.
- [ ] measure start time과 total duration을 검증한다.
- [ ] 최소 구현을 작성한다.

### Task 3. Tone.js piano player TDD

- [ ] Tone.js mock 기반 실패 테스트를 작성한다.
- [ ] `load`, `play`, `pause`, `stop`, `seek`, `dispose`를 검증한다.
- [ ] current time callback과 current measure callback을 검증한다.
- [ ] source/number 전환 시 기존 scheduler가 정리되는지 검증한다.

### Task 4. ScoreViewer cursor control 확장

- [ ] `onMusicXmlLoaded(rawXml)` callback 또는 동등한 공유 경로를 제공한다.
- [ ] measure number 기반 cursor/page 이동 API를 제공한다.
- [ ] 1차 jump 방식은 `cursor.reset()` 후 target measure까지 `nextMeasure()` 반복으로 구현한다.

### Task 5. PracticeStudio transport 연결

- [ ] `악보재생` label을 `피아노 연주`로 바꾼다.
- [ ] piano playback map 생성 상태와 unavailable 상태를 UI 상태에 연결한다.
- [ ] play, pause, stop만 먼저 연결한다.
- [ ] slider seek를 연결한다.
- [ ] currentTime, duration, track fill, playhead를 MR/AR와 같은 규칙으로 표시한다.
- [ ] source, number, raw XML 변경 시 player를 dispose한다.
- [ ] current measure 변경 시 ScoreViewer cursor/page를 이동한다.

### Task 6. Recording 회귀 점검

- [ ] Recording 기본 정책은 MR/AR와 함께 쓰는 것으로 유지한다.
- [ ] `피아노 연주`와 Recording 동시 재생은 후속 결정으로 문서화한다.
- [ ] 기존 recording start, pause, resume, stop, save 테스트를 유지한다.

### Task 7. Playwright 실제 화면 검증

- [ ] `/work` 진입 성공
- [ ] MusicXML SVG 렌더링
- [ ] title 표시 유지
- [ ] `피아노 연주` source 표시
- [ ] 재생 클릭 후 player state와 current time 증가
- [ ] slider seek 후 current time과 active measure 이동
- [ ] cursor/page가 active measure를 따라 이동
- [ ] MR/AR seek 회귀 없음
- [ ] Recording 회귀 없음
- [ ] console error 없음

### Task 8. 최종 검증과 commit

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] 실제 MusicXML/MR/AR 파일이 stage되지 않았는지 확인한다.
- [ ] 명시 파일만 stage한다.
- [ ] Conventional Commit + Codex trailer로 commit한다.

예상 commit:

```text
feat(work): add musicxml piano playback prototype

Add MusicXML note event parsing, Tone.js piano playback, transport integration, and score cursor sync for the Practice Studio piano playback prototype.

Co-Authored-By: Codex CLI <codex@openai.local>
```

## 7. Final Review Corrections

최종 재검토 결과, 계획은 진행해도 된다. 단 구현자는 아래 결정을 기준으로 삼는다.

- 테스트 파일 위치는 기존 repo 패턴에 맞춰 `tests/unit/lib/musicxml/playback-events.test.ts`로 고정한다.
- 1차 기본값은 `전체 간단 재생`이다. 모든 part를 병합하되 polyphony cap과 max event guard를 둔다.
- player wrapper는 `source`, `number`, `MusicXML raw string`이 바뀔 때 기존 Tone object와 scheduler를 반드시 `dispose()`한다.
- scheduler는 note event의 absolute `startSeconds`를 기준으로 삼고, 현재 시간에서 active measure를 lookup한다.
- 자동 검증은 실제 소리 자체가 아니라 scheduling, player state, current time 증가, seek 결과로 판단한다.
- 실제 소리 확인은 수동 청음 체크포인트로 문서화한다.
- UI label이나 버튼 배치가 보이게 바뀌면 구현 전에 변경 전/후 HTML 승인 문서를 먼저 작성한다.

## 8. Acceptance Criteria

- `악보재생`이 더 이상 소리 없는 cursor playback으로 오해되지 않는다.
- `/work`에 `피아노 연주` source가 표시된다.
- MusicXML에서 추출한 note event가 Tone.js로 scheduling된다.
- 브라우저 수동 확인에서 피아노 계열 소리가 난다.
- play, pause, stop, 10초 이동, slider seek가 동작한다.
- 현재 연주 위치에 따라 ScoreViewer cursor/page가 이동한다.
- 기존 MR/AR playback과 Recording 흐름이 깨지지 않는다.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`가 통과한다.
- Playwright 검증 결과와 HTML 문서가 남는다.

## 9. Goal Prompt

```text
Musical Studio repository에서 MusicXML 피아노 연주 기능을 구현해줘.

반드시 한국어로 응답하고, 작업 전 AGENTS.md와 AGENTS.override.md를 확인해줘.
실제 작업 위치는 WSL repo /home/jieun/projects/musical-studio 이야.
기준 브랜치는 codex/local-db-prototype 이야.

먼저 아래 계획 문서를 읽고, Final Review Corrections를 기준으로 task 단위로 진행해줘.
문서:
file://wsl.localhost/Ubuntu-24.04/home/jieun/projects/musical-studio/docs/superpowers/plans/2026-05-31-musicxml-piano-playback-plan.md

목표:
1. 현재 소리 없는 악보재생을 실제 MusicXML 기반 피아노 연주 prototype으로 전환한다.
2. MusicXML note/rest/chord/measure/tempo를 playback event로 변환한다.
3. 기존 dependency인 Tone.js로 피아노 음을 재생한다. 새 dependency는 추가하지 않는다.
4. MR/AR와 동일한 transport UX로 play/pause/stop/10초 이동/slider seek를 지원한다.
5. 현재 연주 위치에 맞춰 OSMD cursor와 page를 동기화한다.
6. 기존 MR/AR 재생과 Recording 흐름을 깨지 않는다.
7. 검증 결과와 공유 HTML 문서를 최신화한다.

중요 규칙:
- MusicXML 파싱은 src/lib/musicxml/ 안에서만 처리한다.
- Tone.js 제어는 src/lib/audio-engine/ wrapper로 분리한다.
- Tone.js는 client-only dynamic import로 처리하고, 사용자 재생 gesture 안에서 Tone.start()를 호출한다.
- source/number/MusicXML raw string 전환 시 기존 player를 dispose한다.
- 실제 MusicXML/MR/AR 파일은 git에 포함하지 않는다.
- DB schema, Supabase migration, 새 dependency는 변경하지 않는다.
- UI가 보이게 바뀌므로 구현 전 변경 전/후 HTML을 먼저 작성한다.
- 좌측 Number 목록, 상단 NickName, 중앙 MusicXML, 하단 Transport/Recording, 우측 제출/Feedback 위치는 유지한다.
- git add . 금지. 특정 파일만 stage한다.

작업 순서:
1. 현재 git 상태와 프로젝트 규칙을 확인한다.
2. 피아노 연주 UI 변경 전/후 HTML을 작성한다.
3. MusicXML raw string을 ScoreViewer와 piano parser가 공유할 수 있는 경로를 설계한다.
4. MusicXML playback event parser 테스트를 먼저 작성하고 실패를 확인한다.
5. parser를 구현한다.
6. Tone.js piano player wrapper 테스트를 먼저 작성하고 실패를 확인한다.
7. player wrapper를 구현한다.
8. PracticeStudio transport에 피아노 연주 source의 play/pause/stop만 먼저 연결한다.
9. slider seek를 연결한다.
10. ScoreViewer cursor controller를 measure 기반으로 확장하고 cursor/page sync를 연결한다.
11. MR/AR와 Recording 기존 테스트가 깨지지 않는지 확인한다.
12. Playwright로 /work에서 피아노 연주, cursor sync, seek, 기존 MR/AR/Recording 회귀를 검증한다.
13. 자동 검증은 playback state와 scheduling으로 확인하고, 실제 소리는 수동 청음 체크포인트로 문서화한다.
14. pnpm lint, pnpm typecheck, pnpm test를 실행한다.
15. 검증 통과 후 Conventional Commit + Co-Authored-By trailer로 commit한다.
```

## 10. Self-Review

- 사용자의 “악보를 피아노로 실제로 쳐주는 작업” 요구를 parser, audio engine, transport, cursor sync, 검증, 문서화로 나눴다.
- 구현 전 UI 변경 승인이라는 Musical Studio 그라운드 룰을 명시했다.
- 새 dependency 없이 Tone.js를 사용하는 경로를 선택했다.
- 자동 검증과 실제 청음의 한계를 분리했다.
- 현재 계획은 implementation prompt로 사용해도 된다.
