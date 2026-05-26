# CONTEXT.md — Musical Studio 도메인 용어집

> AI 에이전트와 개발자가 변수/함수/파일명을 일관되게 짓도록 하는 단일 어휘 사전.
> 새 용어 추가 시 양쪽 개발자가 review.

## 코어 음악 도메인

**Musical** — 한 작품 단위. 여러 Number를 포함.
- _Avoid_: musical-play, show, performance

**Number** — 뮤지컬의 한 곡. DB 테이블 `musical_numbers`.
- _Avoid_: song, track, piece

**Score** — 한 Number의 MusicXML 악보 자체. 파일.
- _Avoid_: sheet, music-file

**Part** — Score 내 한 악기/배역의 보표(staff) 그룹. MusicXML `<part>` 1개.
- _Avoid_: instrument, track, voice

**Voice** — Part 내 sub-stream (예: 소프라노/알토 같은 staff 분리). MusicXML `<voice>`.
- _Avoid_: line

**Measure** — 마디. 작은 시간 단위. MusicXML `<measure>`.
- _Avoid_: bar (영국식), section

**Role** — 곡 안의 배역 (예: Hikaru, Ensemble). DB `member_roles`.
- _Avoid_: character, persona, casting

**Beat** — 박. BPM 계산 단위.

**Tempo** — 빠르기. BPM 단위로 저장.

**Key** — 조성. 예: C major, F# minor.

**Transposition** — 조옮김. UI 동작.

## 오디오 도메인

**MR** — Music Recording (반주 음원). mp3 우선. `mr_url` 필드.
- _Avoid_: backing-track, accompaniment, BGM

**Recording** — 사용자가 자기 목소리로 녹음한 결과물. DB `recordings`. WAV 기본.
- _Avoid_: take (영화 용어), voice-memo

**Practice Recording** — `Recordings.type = 'Practice'`. 연습 단계.

**Homework Recording** — `Recordings.type = 'Homework'`. 숙제 제출용.

**Representative Recording** — 승인된 대표본. `is_representative = true`.
- _Avoid_: official, canonical

**Sync Source** — 동기화 기준 원본. 항상 WAV. 절대 MP3 아님.

**MP3 Export** — 다운로드/외부 공유용 파생물.

**Waveform** — 파형. Wavesurfer.js로 렌더링 (Phase 3).

**Latency** — 녹음/재생 지연. 캘리브레이션 대상 (Phase 2).

**Leakage** — 마이크에 들어간 MR 소리. 이어폰 미사용 시 발생. 경고 대상.

## 인증/권한 도메인

**Member** — 부원. DB `users.role = 'Member'`.
- _Avoid_: user (너무 모호), student

**Director** — 연출가. `users.role = 'Director'`.
- _Avoid_: instructor, teacher

**Admin** — 관리자. `users.role = 'Admin'`.

**Assignment** — 과제. 곡 × 주차 단위. DB `assignments`.
- _Avoid_: task, lesson

**Submission** — Homework Recording의 제출 사실. 현재는 `recordings.type='Homework'`로 단순화.

**RepRequest** — 대표본 신청. DB `rep_requests`. Status: Pending/Approved/Rejected.

## 외부 시스템

**Soundslice** — 절대 런타임 의존 금지. **UX 레퍼런스로만 참고**. 자세한 내용 `docs/adr/0002-soundslice-vs-self-host.md`.
- _Avoid_: 외부 임베드를 "Soundslice 임베드"로 부르지 말 것 — 사용 안 함

**OSMD** — OpenSheetMusicDisplay. MusicXML 렌더링 라이브러리.

**Tone.js** — Web Audio API 추상화. Phase 2 동기화 엔진.

**Wavesurfer.js** — 파형 + 타임라인 코멘트. Phase 3.

**Supabase** — Auth + PostgreSQL + Storage + Realtime.

**Google Drive** — MusicXML/PDF/MR 원본 파일 출처 (관리자가 등록).

## 코드 컨벤션 (네이밍)

- 컴포넌트: PascalCase, 단수형 (예: `ScoreViewer.tsx`, `RecordingButton.tsx`)
- 훅: `use*` 카멜케이스 (예: `useAudioRecorder`, `useScoreRendering`)
- 유틸 함수: 동사 시작 (예: `parseMusicXml`, `encodeWav`)
- DB 테이블: snake_case 복수형 (예: `musical_numbers`, `member_roles`)
- DB 컬럼: snake_case (예: `xml_url`, `is_representative`)
- 타입: PascalCase 단수형 (예: `MusicalNumber`, `MemberRole`)
- enum: PascalCase (예: `RecordingType = 'Practice' | 'Homework'`)
- 환경변수: UPPER_SNAKE (예: `NEXT_PUBLIC_SUPABASE_URL`)

## 파일 확장자 정책

- `.musicxml` / `.xml` (uncompressed) / `.mxl` (zip)
- `.mp3` (MR 우선), `.wav` / `.m4a` (허용)
- `.wav` (사용자 녹음 sync 원본)
- 추후 `.mp3` (다운로드용 export)

## 헷갈리는 표현 BEFORE / AFTER

**BEFORE**: "녹음 중 MR이 같이 녹음되면 안 된다"
**AFTER**: "Recording에 MR leakage가 발생하면 안 된다"

**BEFORE**: "이 곡의 소프라노 파트를 보여줘"
**AFTER**: "이 Number의 Soprano Part를 표시"

**BEFORE**: "Soundslice처럼 마디 단위 반복"
**AFTER**: "OSMD 위에 Measure 단위 loop control"

---

새 용어가 필요할 때 이 파일을 먼저 업데이트한 뒤 코드에 적용. **AI 에이전트는 이 사전에 없는 용어를 새로 만들기 전 사용자에게 물어볼 것.**
