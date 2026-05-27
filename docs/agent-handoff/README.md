# Agent Handoff Protocol

> 다른 AI 에이전트 또는 사람이 마무리해야 할 작업을 명시적으로 인수인계하는 폴더. GitHub native 파일 기반 — 외부 서비스 0개, 모든 history는 git commit으로 영구 보존.

## 디렉토리

```
docs/agent-handoff/
├── README.md            # 이 파일 (프로토콜)
├── open/                # 미해결 — 다음 agent가 처리할 항목
│   └── YYYY-MM-DD-<slug>.md
└── closed/              # 해결 완료 (archive)
    └── YYYY-MM-DD-<slug>.md
```

## 새 handoff 만들 때 (세션 종료 직전)

다음 조건 충족 시 파일 1개 commit:

- 시작했는데 마무리 못 한 작업
- 권한 부족 blocker (예: Supabase RLS, OAuth secret 회전)
- 의도적 미완성 (backend stub만 만들고 frontend는 다른 agent가)
- 다른 agent에게 알려야 할 side effect (API 변경, 신규 의존성 등)

### 파일 위치 + 이름

`docs/agent-handoff/open/YYYY-MM-DD-<short-slug>.md`

예: `docs/agent-handoff/open/2026-05-28-supabase-rls-recordings-bucket.md`

### 템플릿 (그대로 복사 후 채우기)

```markdown
---
from: claude-code        # 또는 antigravity, codex-cli
to: any                  # 또는 specific agent (예: codex-cli)
priority: high           # high | normal | low
related_branch: ai/claude/feat-supabase-rls
related_commits:
  - abc1234
  - def5678
related_files:
  - supabase/migrations/20260528...sql
  - src/lib/supabase/server.ts
created_at: 2026-05-28T14:30:00Z
---

## Context
무엇을 하려고 했나 (왜 이 작업을 시작했는지 — 사용자 요청 또는 ADR 참조)

## Done
- ✅ 이미 완료한 것
- ✅ 작성한 파일/함수

## Blocked on
무엇 때문에 멈췄나. 누가 해결해야 하나.
- (예) Supabase Dashboard에서 service_role을 사용해 RLS bypass 정책 추가 필요 — Owner만 가능
- (예) Google Cloud Console에서 OAuth scope 추가 필요

## Suggested next step
다음 agent가 할 일 (구체적으로, 명령 단위로)
1. `git checkout ai/claude/feat-supabase-rls`
2. `supabase/migrations/...` 확인
3. ...

## References
- 관련 issue / PR: #N (있으면)
- 관련 docs: docs/adr/0003-... (있으면)
```

## handoff 닫을 때 (해결 완료)

```bash
git mv docs/agent-handoff/open/<file>.md docs/agent-handoff/closed/
git commit -m "chore(handoff): close <slug> — resolved by <agent>

해결 내용 1~2줄 요약. 어떤 commit/PR이 해결했나."
```

## 세션 시작 체크리스트 (AI agent 매번)

```bash
# 1. 미해결 handoff 확인
ls docs/agent-handoff/open/
# 있으면 모두 읽고 본인이 처리 가능한지 판단

# 2. 직전 활동 log
ls docs/agent-log/ | tail -3
cat docs/agent-log/$(ls docs/agent-log/ | tail -1)
```

## 자주 묻는 질문

**Q. GitHub Issues를 쓰면 안 되나요?**
- 가능하지만 git history와 별도로 떠다님. 본 프로젝트는 commit 자체가 audit trail이 되도록 file-based로 통일.
- 외부 의존성 0 정책에도 부합.

**Q. handoff 파일이 너무 많이 쌓이면?**
- `closed/` 디렉토리는 archive. 90일 지난 항목은 별도 정리 가능 (git 히스토리에는 영구 보존).

**Q. priority가 high면 알림이 가나요?**
- 자동 알림 없음. 대신 `docs/agent-log/` 일일 요약에 `[high-priority handoff: ...]` 형태로 명시됨 (GitHub Actions workflow가 자동 처리).

## 관련 문서

- `docs/agent-log/` — 일일 활동 요약 (자동 생성)
- `docs/agent-decisions/` — Architectural 결정 (수동, ADR 가벼운 버전)
- `AGENTS.md` — 프로젝트 SSoT
