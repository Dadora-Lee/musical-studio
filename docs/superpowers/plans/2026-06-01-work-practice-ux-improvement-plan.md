# Practice Studio UX 개선 상세 계획

작성일: 2026-06-01  
대상 브랜치: `codex/local-db-prototype`  
대상 화면: `/work`

## 목표

피아노 연주, MusicXML 악보, MR/AR 재생, 녹음 흐름이 한 화면에서 자연스럽게 이어지도록 `/work` 화면의 연습 UX를 정리한다. 기존 합의된 주요 배치는 유지한다.

- 좌측: Number 목록 유지
- 중앙: MusicXML 악보 유지
- 하단: Transport/Recording 유지
- 우측: 제출/Feedback 유지

## 현재 확인된 문제

1. 피아노 연주 중 악보가 자동으로 움직여 사용자가 현재 페이지와 위치를 잃는다.
2. 가사 크기가 작아 배우가 연습 중 읽기 어렵다.
3. 볼륨 컨트롤이 항상 노출되어 하단 공간을 크게 차지한다.
4. 재생, 일시정지, 정지 아이콘이 현재 상태를 명확히 보여주지 못한다.

## 권장 방향

`A형 · 고정 악보 + 현재 마디 하이라이트`를 1차 구현안으로 추천한다.

이유:

- 현재 문제의 핵심인 악보 자동 이동을 가장 작은 범위로 해결한다.
- 기존 UI 배치를 유지한다.
- OSMD 렌더링 구조를 크게 바꾸지 않고도 현재 마디 하이라이트와 상태 표시를 개선할 수 있다.
- 가사 문제는 Zoom과 마디 수 조절로 MVP 범위 안에서 해결한다.
- waveform은 유용하지만 녹음 안정화 이후가 더 적절하다.

## Goal 1. 악보는 고정하고 현재 위치만 표시

### 변경 전

- 피아노 연주 중 `onMeasureChange`가 `scoreController.goToMeasure()`를 호출한다.
- `ScoreViewer`는 OSMD cursor를 이동시키고 `revealCursor()`를 통해 악보 위치를 화면 안으로 가져온다.
- 결과적으로 악보가 재생 중 계속 움직인다.

### 변경 후

- 피아노 연주 중 페이지는 자동 이동하지 않는다.
- 현재 마디 또는 현재 음표만 색상으로 표시한다.
- MVP는 마디 단위 하이라이트로 시작한다.
- 현재 마디가 현재 페이지 밖에 있을 때는 자동 이동하지 않고, 상단 pager에 "현재 연주 위치가 다른 페이지에 있음" 상태만 표시한다.
- 추후 옵션으로 `Follow Page` 토글을 추가할 수 있지만 기본값은 off로 둔다.

### 구현 후보

- `ScoreViewer`에 `highlightMeasure(measureNumber)` API를 추가한다.
- 기존 `goToMeasure`는 수동 이동용으로 남기되 피아노 재생에서는 호출하지 않는다.
- OSMD SVG에서 measure 관련 group 또는 bounding box를 찾아 overlay div/SVG rect를 그린다.
- OSMD 내부 구조가 곡마다 다를 수 있으므로 실패 시 cursor 색상 변경이 아니라 별도 경고 없이 하이라이트만 생략한다.

### 검증

- 피아노 재생 중 A4 paper container의 scroll position이 변하지 않아야 한다.
- 현재 마디 하이라이트가 재생 시간에 따라 바뀌어야 한다.
- 페이지 버튼을 수동으로 눌렀을 때만 페이지가 바뀌어야 한다.

## Goal 2. 가사 가독성 개선

### 변경 전

- B형 균등 연습형 기준으로 한 줄 4마디를 기본으로 렌더링한다.
- 작은 화면이나 가사가 많은 악보에서 lyric이 작게 보인다.

### 변경 후

- 악보 상단 또는 pager 영역에 compact한 보기 설정을 추가한다.
- 1차 옵션:
  - Zoom: `100%`, `125%`, `150%`
  - Measures per line: `3`, `4`
- 2차 옵션:
  - Measures per line: `2`
  - lyric-friendly mode
- 설정 변경 시 OSMD를 다시 렌더링한다.
- A4 비율은 유지하고, 잘림이 생기면 OSMD scale/page fit을 우선한다.

### 검증

- 100/125/150 변경 시 악보가 잘리지 않는다.
- 3마디/4마디 변경 시 title이 유지된다.
- 가사 텍스트가 이전보다 커지거나 마디 간 여유가 늘어난다.
- 설정 변경 후 좌측 목록, 우측 Feedback 위치는 변하지 않는다.

## Goal 3. 볼륨 컨트롤 정리

### 변경 전

- MR Volume과 Monitor Volume slider가 하단에 항상 노출된다.
- 하단 transport가 복잡하고 세로 공간을 많이 차지한다.

### 변경 후

- 볼륨은 스피커 아이콘 버튼으로 축약한다.
- 아이콘 클릭 시 popover가 열린다.
- popover 안에 현재 source volume과 monitor volume을 표시한다.
- 장치 선택은 기존처럼 접힘 패널에 유지하거나 popover와 별도 버튼으로 유지한다.
- waveform lane은 이번 1차 구현에서는 하지 않고, 녹음 안정화 이후 v1.5로 둔다.

### 검증

- 기본 화면에서 volume slider가 항상 보이지 않아야 한다.
- 스피커 버튼을 클릭하면 volume popover가 열리고 닫혀야 한다.
- slider 조작 시 실제 audio volume이 변경되어야 한다.
- 키보드 접근성과 aria label을 유지한다.

## Goal 4. 재생 상태가 보이는 Transport

### 변경 전

- 재생, 일시정지, 정지가 별도 버튼이다.
- 현재 재생 중인지, 멈춘 상태인지 버튼 상태만으로는 잘 보이지 않는다.

### 변경 후

- 재생/일시정지를 하나의 primary toggle button으로 합친다.
- 정지는 reset/stop 버튼으로 남긴다.
- 버튼 상태:
  - idle: Play 아이콘
  - playing: Pause 아이콘 + active style
  - paused: Play 아이콘 + paused 상태 표시
  - unavailable: disabled
- source selector는 기존 위치를 유지하고 active source만 명확히 표시한다.

### 검증

- MR/AR/Piano source 각각에서 play/pause toggle이 동일하게 동작한다.
- 재생 중 버튼 시각 상태가 바뀐다.
- 정지를 누르면 시간과 track fill이 0으로 돌아간다.
- `play() request was interrupted by a call to pause()` 콘솔 오류가 재발하지 않아야 한다.

## 구현 순서

1. 변경 전/후 HTML 제안서 확인 및 사용자 승인
2. `ScoreViewer` 하이라이트 API 설계
3. 피아노 재생에서 자동 page/cursor reveal 제거
4. 현재 마디 하이라이트 구현
5. Zoom / measures per line 보기 설정 추가
6. 볼륨 popover UI로 변경
7. play/pause toggle transport 적용
8. unit test와 Playwright 검증 갱신
9. 변경 결과 HTML 문서와 스크린샷 저장
10. lint, typecheck, test 실행

## 테스트 계획

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Playwright:
  - `/work` 진입
  - MusicXML title 표시
  - 피아노 재생 시작
  - 악보 container 위치가 자동으로 변하지 않는지 확인
  - 현재 마디 하이라이트 표시 확인
  - Zoom 변경 후 A4 fit 확인
  - Measures per line 변경 후 title 유지 확인
  - volume popover open/close 확인
  - MR/AR/Piano play/pause toggle 상태 확인

## Acceptance Criteria

- 피아노 연주 중 악보는 기본적으로 움직이지 않는다.
- 현재 위치가 마디 또는 음표 색상으로 표시된다.
- 가사 가독성을 위해 Zoom 또는 마디 수 조절이 가능하다.
- 볼륨 slider는 기본 화면에서 접혀 있고, 아이콘으로 접근 가능하다.
- 재생 상태가 버튼 시각 상태로 명확히 보인다.
- 좌측 Number 목록, 중앙 악보, 하단 transport, 우측 제출/Feedback 배치는 유지된다.
- 모든 자동 검증이 통과한다.

## 구현 프롬프트

아래 문서를 기준으로 `/work` Practice Studio UX 개선을 구현한다.

- 계획 문서: `file://wsl.localhost/Ubuntu-24.04/home/jieun/projects/musical-studio/docs/superpowers/plans/2026-06-01-work-practice-ux-improvement-plan.md`
- 선택안 HTML: `file://wsl.localhost/Ubuntu-24.04/home/jieun/projects/musical-studio/docs/ui-change-proposals/2026-06-01-work-practice-ux-improvement-options.html`

실행 규칙:

1. Musical Studio `AGENTS.md`와 `AGENTS.override.md`를 먼저 확인한다.
2. UI 변경 전에는 선택안 HTML이 승인되었는지 확인한다.
3. 승인된 방향만 구현한다.
4. MusicXML 원본, MR/AR 파일, `.env*`는 커밋하지 않는다.
5. 변경 후 `pnpm lint`, `pnpm typecheck`, `pnpm test`를 실행한다.
6. Playwright로 `/work`에서 악보 고정, 마디 하이라이트, 볼륨 popover, play/pause 상태를 검증한다.
7. 검증 결과를 HTML 문서로 남긴다.
