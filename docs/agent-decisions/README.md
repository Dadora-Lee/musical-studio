# Agent Decisions

> AI 에이전트끼리 공유해야 할 일일 architectural 결정. ADR보다 가벼움 (1~2 단락).
> 무거운 결정은 `docs/adr/` (정식 ADR) 사용.

## 언제 여기에 쓰나

- 새 라이브러리 도입 (가벼운 경우)
- naming convention 결정 (CONTEXT.md 미반영 항목)
- 작은 아키텍처 패턴 정착 (예: "이런 경우엔 server action 대신 route handler")
- 회피한 접근 + 이유 (다른 agent가 같은 함정에 빠지지 않도록)

**큰 결정 (ADR-worthy)**:
- 새 외부 의존성 (Supabase → 다른 DB 등)
- DB 스키마 변경
- Auth/RLS 정책 변경
- 라이선스 관련

→ `docs/adr/00XX-...md` 작성.

## 파일 이름

`docs/agent-decisions/YYYY-MM-DD-<short-slug>.md`

예: `docs/agent-decisions/2026-05-28-osmd-pitch-naming.md`

## 템플릿

```markdown
# <Decision title>

**Date**: 2026-05-28
**By**: claude-code (또는 antigravity, codex-cli)
**Scope**: src/lib/musicxml/ (또는 영향 범위)

## Context
1~2 문장. 어떤 상황에서 결정 필요했나.

## Decision
어떻게 하기로 했나. 1~2 단락.

## Rationale
왜 이걸 채택했나. 다른 옵션은? 1~2 단락.

## Implications for other agents
- 향후 같은 영역 작업 시 이걸 따라야 함
- 또는 변경 시 ADR로 격상
```

## 세션 시작 시 읽기

```bash
# 최근 3개 결정 확인
ls -1 docs/agent-decisions/*.md 2>/dev/null | grep -v README | tail -3
```

## 관련 문서

- `docs/agent-log/` — 일일 활동 요약
- `docs/agent-handoff/` — 인수인계
- `docs/adr/` — 정식 ADR (큰 결정)
