---
from: claude-code
to: any                       # 다음 세션(업데이트된 Claude Code) 또는 Codex(jieun0610)
priority: high
related_branch: codex/local-db-prototype, codex/studio-ui-checkpoint
related_commits:
  - ba7c068   # codex/local-db-prototype HEAD (리뷰 대상)
  - 1a99c62   # codex/studio-ui-checkpoint HEAD (리뷰 대상)
  - 8b3db86   # origin/main HEAD (리뷰 기준)
related_files:
  - supabase/migrations/20260527000000_initial_schema.sql
  - src/lib/musicxml/playback-events.ts
  - src/components/practice/PracticeStudioLayout.tsx
  - src/app/api/prototype-assets/[numberId]/[kind]/route.ts
created_at: 2026-06-02T00:00:00Z
---

## Context

Owner(Dadora-Lee)가 jieun0610(Codex CLI 사용)의 codex 브랜치 2종을 리뷰하고, 공동 개발자가
**다시 검토·업그레이드**할 수 있도록 GitHub 협업(PR + 리뷰 코멘트 + handoff)으로 연결하려는 작업.

이번 세션에서 **로컬 git 정리 + 두 브랜치 소스 단위 코드리뷰 + RLS 도입 비용 분석 + 협업 방법 설계**까지
완료했고, **실제 PR/리뷰 코멘트 생성은 미실행**(범위 결정 대기 중).

→ 다음 세션 계획: **Claude Code 버전 업그레이드 후 `ultracode`로 codex 최신 브랜치 전체 재리뷰**,
그 결과로 공동 개발자와 협업(PR + handoff) 진행. (현재 버전 2.1.157)

## Done (이번 세션 완료분)

### 1. 로컬 git 정리 (완료·push됨)
- ✅ 로컬 `main`의 미push 커밋 1건 push (`8fad3c0`). 중간에 auto-summary 워크플로(`5caf97d`)와
  충돌 → rebase 후 재push.
- ✅ 미추적 handoff 문서 `2026-05-28-jieun0610-push-activation.md`를 `closed/`로 이동·commit (`8b3db86`).
  근거: jieun0610이 `codex/local-db-prototype`를 **본인 명의로 push 성공**(05-29) → push 권한/인증 blocker 해결 확인.
- ✅ 현재 `main` = `origin/main` = `8b3db86`, 작업 트리 clean.

### 2. 원격 브랜치 현황
- `origin/codex/local-db-prototype` (`ba7c068`): 05-29~06-01 사이 **8커밋 추가**되어 DB 프로토타입 →
  연습 스튜디오 / MusicXML 피아노 재생 / 녹음 PoC까지 확장. **83파일 / +14,644줄**(대부분 HTML/PNG 검증문서).
- `origin/codex/studio-ui-checkpoint` (`1a99c62`): 변동 없음. 스튜디오 UI/어드민/auth/Drive (57파일 / +5,635줄).
- 두 브랜치 모두 **PR 없음**, **임의 머지 안 함**.

### 3. 코드 리뷰 결과 (소스 단위, 서브에이전트 병렬 리뷰)

#### A. `codex/local-db-prototype` — 결론: **needs fixes (현 상태 main 머지 보류)**
- **[높음] 프로덕션 마이그레이션 in-place 교체** (`supabase/migrations/20260527000000_initial_schema.sql`):
  동일 파일명으로 main의 7테이블 + **RLS 정책 18개 + Storage 정책 3개**를 4테이블(numbers/members/works/comments)
  프로토타입으로 덮어씀. 신규 마이그레이션으로 분리 안 됨. **단, 그린필드 재구축이면 데이터 손실은 문제 아님**
  (아래 RLS 분석 참조). 실질 리스크는 "새 스키마에 RLS가 0개" → 클라우드 배포 시 공개 DB.
- **[높음] MusicXML 파싱: backup/forward 미처리** (`playback-events.ts:73`) + **tie 미처리** (`:73-97`):
  다성부 피아노 악보에서 재생 타이밍이 깨질 수 있음. grace note도 미처리. **테스트가 단성부만 커버**해 결함 은폐.
- **[중간] 녹음 중 언마운트 시 recorder 미정지** (`PracticeStudioLayout.tsx:486-493`): post-unmount setState 누수.
- **[중간] webm 녹음이 항상 무음 WAV로 대체** (`:1088-1091`): 대부분 브라우저 기본이 webm → 저장 take가 무음.
- **[중간] 프로토타입 자산 라우트 무인증 노출** (`api/prototype-assets/.../route.ts`): prod에서 미들웨어 게이트 미적용.
  단 **path traversal은 whitelist 조회로 확실히 차단됨**(안전).
- ✅ 깨끗: 시크릿 하드코딩 없음, service_role 클라이언트 누출 없음, blob URL/마이크 스트림 정리 모범적,
  셸 스크립트 `db reset`은 `/tmp` 로컬 컨테이너로 격리.
- 잔여 머지 선결: ① 마이그레이션 신규 파일 분리 ② backup/tie 처리 + 다성부 테스트 ③ 자산 라우트 prod 노출 차단.

#### B. `codex/studio-ui-checkpoint` — 결론: **needs fixes (보안 치명결함은 없음)**
- **[중간] 가입 플로우 미작동**: `ensureMemberForAuthenticatedUser`(부트스트랩)가 어디서도 호출 안 됨 →
  신규 Google 로그인 사용자 `members` 미생성, 영구 pending. OAuth 콜백에서 호출 추가 필요.
- **[중간] dev-admin 백도어 prod 게이트** (`src/lib/auth/dev-admin.ts:81-83`): prod에서도
  `ENABLE_DEV_ADMIN_UNLOCK=true`+`DEV_ADMIN_PASSWORD` 시 어드민 우회 활성. 토큰은 HMAC/TTL/timingSafeEqual로
  보호되나 prod 강제 비활성 가드·`.env.example` 문서화 부재.
- **[낮음]** service_role 읽기 함수 자체 권한검증 없음(현 호출처는 안전), 일부 파일 BOM/CRLF + 한글 UI 텍스트 `????` 깨짐.
- ✅ 깨끗: 어드민 mutation 전부 `requireAppRole(["admin"])` 선행, service_role 키 클라이언트 누출 없음,
  하드코딩 시크릿 없음, 콜백 오픈 리다이렉트 방어됨.

### 4. RLS 도입 비용 분석 (사용자 질의 대응)
**핵심 발견: 현재 앱은 4개 테이블을 단 한 번도 쿼리하지 않음**(`.from()` 호출 0건, 연습/작업 화면은
`prototype-data.ts` 목 데이터 + 디스크 자산으로 동작). 따라서 RLS는 현재 임계 경로 밖.
- **Tier 0 (deny-by-default RLS)**: 4테이블에 `enable row level security`만 추가(정책 0=anon/authenticated 차단,
  서버 service_role은 통과). **SQL ~6줄, 앱 코드 0줄, 0.5일 미만.** → "공개 DB" 구멍 즉시 차단. **특정 모듈 수준의 작은 변경.**
- **Tier 1 (per-user/역할 RLS)**: 정책 작성 자체는 1~1.5일이나, 전제조건(members↔auth.users 연결, 로그인,
  역할 모델 — 현재 전부 없음, studio-ui-checkpoint에 일부 구현됨)이 3~5일. 단 이 기반은 "RLS 비용"이 아니라
  "mock→실DB 전환 비용"으로 어차피 필요.
- **권장**: 지금은 Tier 0만, 실 DB 연동 시점에 auth 기반과 함께 Tier 1.

### 5. 협업 방법 설계 (검증 완료, 미실행)
이 repo는 git-native 협업 시스템(`docs/agents/agent-coordination.md`). 채널 2개:
- **GitHub PR + 리뷰 코멘트**: `main` protected(PR+1 approval), CODEOWNERS가 양방 리뷰 라우팅.
  codex 브랜치가 건드린 `/supabase/migrations/`, `/src/lib/{audio-engine,musicxml,supabase}/`가
  **전부 양방 review 필수 구역**. PR 열면 CI(ci.yml)도 자동.
- **파일 handoff** (`docs/agent-handoff/open/`): Codex 에이전트가 세션 시작 체크리스트에서 반드시 확인 → AI 픽업에 확실.
- jieun0610의 AI 에이전트 = **Codex CLI** (브랜치명 `codex/...`).

## Blocked on / 미결정 (다음 세션에서 결정)

PR/리뷰 코멘트 **실행 전 사용자 결정 대기** 중:
1. 대상 브랜치: local-db-prototype만 / 둘 다 / studio-ui-checkpoint만
2. 리뷰 코멘트 깊이: 요약+핵심 인라인 / 전체 인라인 / PR 본문 요약만
3. handoff 동반 여부 (PR+handoff 권장)
4. PR 작성 주체: Owner gh로 대신 생성(작성자=Dadora-Lee, author=jieun0610) vs handoff로 "PR 열어달라" 요청만
5. Draft PR(리뷰·개선 목적) vs 일반 PR(머지 의도) — 현 리뷰 결론은 둘 다 "머지 보류"라 Draft 권장
- 현재 `gh`는 **Dadora-Lee(Owner)** 계정으로 인증됨.

## Suggested next step (다음 세션 — 업데이트된 Claude Code + ultracode)

아래 "다음 세션 시작 프롬프트"를 그대로 붙여넣어 시작.

1. `git pull --rebase origin main` + 세션 시작 체크리스트(agent-coordination.md) 수행, 이 handoff 읽기.
2. `git fetch --all --prune`로 codex 브랜치에 **추가 업데이트 들어왔는지** 먼저 확인(이번 세션 이후 변동 가능).
3. **`ultracode` 활성화 상태에서 codex 최신 브랜치(local-db-prototype, studio-ui-checkpoint) 전체 코드리뷰**
   — 워크플로 오케스트레이션으로 영역별 fan-out + 적대적 검증. 본 문서 §3 findings를 기준선으로 삼아
   회귀/신규 이슈 비교.
4. 리뷰 결과로 위 "미결정 1~5" 사용자와 확정 → PR(Draft 권장) 생성 + 리뷰 코멘트 + handoff 작성으로 협업 연결.

## References

- 협업 시스템: `docs/agents/agent-coordination.md`, `docs/agents/collaborator-roles.md`
- CODEOWNERS (양방 review 구역)
- 본 세션 리뷰 기준: `origin/main` = `8b3db86`
