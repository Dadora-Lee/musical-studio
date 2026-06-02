---
from: claude-code            # ultracode 재리뷰 세션 (Dadora-Lee)
to: jieun0610                # Codex CLI (codex/* 브랜치 작성자)
priority: high
related_branch: codex/local-db-prototype, codex/studio-ui-checkpoint
related_pr:
  - "https://github.com/Dadora-Lee/musical-studio/pull/1"   # local-db-prototype Draft PR
  - "https://github.com/Dadora-Lee/musical-studio/pull/2"   # studio-ui-checkpoint Draft PR
related_commits:
  - ba7c068   # codex/local-db-prototype HEAD (리뷰 대상)
  - 1a99c62   # codex/studio-ui-checkpoint HEAD (리뷰 대상)
created_at: 2026-06-02T06:30:00Z
supersedes: docs/agent-handoff/closed/2026-06-02-codex-branches-review-collab.md
---

## Context

이전 세션 계획(ultracode 재리뷰 → 협업 연결)을 **완료**했습니다. 두 codex 브랜치를 `ultracode` 멀티에이전트
워크플로(10개 영역 fan-out → 발견별 적대적 검증 correctness+skeptic 2렌즈, 135 에이전트, 62건 전수)로
재리뷰하고, 그 결과를 **Draft PR 2개 + 인라인 리뷰 코멘트 16건**으로 연결했습니다. 이 문서는
jieun0610(Codex CLI)이 **자기 작업(미push 로컬 개선분 포함) 위에 선결 수정을 적용**하도록 넘기는 핸드오프입니다.

> **적용 원칙(중요):** 리뷰는 push된 HEAD(`ba7c068`/`1a99c62`) 기준입니다. 로컬에 아직 push 안 한 추가
> 개발분이 있다면, 각 finding은 자기완결형이니 **이미 반영한 항목은 건너뛰고 남은 항목만** 본인 작업 위에
> 비파괴적으로 적용하세요. 어떤 항목도 기존 작업을 되돌리라는 의미가 아닙니다.

## 리뷰 결론 (요약)

| 브랜치 | 머지 가부 | High/Med/Low/Info | Draft PR |
|---|---|---|---|
| codex/local-db-prototype (ba7c068) | 보류 | 2/6/9/4 | https://github.com/Dadora-Lee/musical-studio/pull/1 |
| codex/studio-ui-checkpoint (1a99c62) | 보류 | 1/9/8/6 | https://github.com/Dadora-Lee/musical-studio/pull/2 |

- 적대적 재검증에서 contested 0 (모두 confirmed/severity-adjusted로 수렴). 깨끗 검증 90건.
- 기준선(이전 §3) 대비 주요 변화: **REC-WEBM medium→high 상향**, **MIG high→medium 하향(앱 미쿼리·전부 목업)**,
  **ASSET-ROUTE high→medium**, **studio OAuth 콜백 open-redirect = 신규 HIGH(이전 CLEAN 오판 회귀)**,
  **studio: members/productions/number_assets 등 스키마·`number-assets` 버킷이 마이그레이션에 부재(admin/auth fresh DB 재현 불가)**.

## jieun0610(Codex CLI)에게 요청 — 선결 수정 (PR별 우선순위)

### PR #1 · codex/local-db-prototype
1. **[high] REC-WEBM** `PracticeStudioLayout.tsx:1088-1097` — webm 단락 제거, 모든 blob decode→WAV.
2. **[high] MXML backup/forward** `playback-events.ts:58-106` — 자식 문서순 순회+커서 가감, multi-voice fixture.
3. **[med]** MIG RLS/히스토리, ASSET-ROUTE 인증, /mnt/e 경로, sync-env dotenv 이스케이프, test-gaps, REC-UNMOUNT.

### PR #2 · codex/studio-ui-checkpoint
1. **[high] OAuth 콜백 open-redirect** `auth/callback/route.ts` — `new URL(next,origin)` origin 검증 fallback.
2. **[med]** 미존재 스키마/버킷 마이그레이션 추가(**최대 블로커**), SIGNUP 콜백 연결, DEVADMIN prod hard-disable,
   업로드 검증(isAllowedFile), last-admin TOCTOU + 도메인 테스트.

상세 근거·수정안·file:line은 각 PR 본문(종합)과 인라인 코멘트에 있습니다.

## 협업 방식 결정 (이번 세션 확정)

1. 대상 브랜치: **둘 다**
2. PR 형태: **Draft**(둘 다 머지 보류 → 리뷰·개선 목적, 개선 후 Ready 전환)
3. PR 작성 주체: **Owner(Dadora-Lee) gh로 대신 생성** (코드 author는 jieun0610 유지)
4. 리뷰 코멘트 깊이: **high/medium 핵심 인라인 + PR 본문 종합**
5. handoff 동반: **예**(본 문서)
- CODEOWNERS상 마이그레이션·auth·musicxml·audio-engine·supabase 구역은 양방 review 필수. **Draft PR은
  CODEOWNERS 자동 리뷰어 요청이 발동하지 않아**, 두 PR 모두 jieun0610을 **수동 리뷰어로 명시 요청**해 둠.

## Suggested next step (jieun0610 / Codex CLI)

1. 두 Draft PR(#1, #2)의 인라인 코멘트 + 본문 종합 확인 (`gh pr view 1 --comments`, `gh pr view 2 --comments`).
2. 본인 로컬 개선분과 대조 → 미반영 선결 항목만 해당 브랜치에 커밋(비파괴적).
3. high/medium 선결 완료 시 PR을 Ready로 전환(`gh pr ready <n>`), CODEOWNERS 양방 review로 머지 진행.
4. 추가 논의 필요 시 본 open/ 핸드오프에 회신 파일 추가 또는 PR 코멘트로.

## References
- 리뷰 기준선: `origin/main` 시점 merge-base = `ae5db5e`. 이전 리뷰 문서: `docs/agent-handoff/closed/2026-06-02-codex-branches-review-collab.md`
- 협업 시스템: `docs/agents/agent-coordination.md`, `CODEOWNERS`
