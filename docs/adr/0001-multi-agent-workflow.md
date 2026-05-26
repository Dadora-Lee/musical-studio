# ADR-0001: 멀티 AI 에이전트 협업 워크플로

- **Status**: Accepted
- **Date**: 2026-05-27
- **Deciders**: Dadora-Lee (+ 파트너 비동기 review)

## Context

2명의 개발자가 한 코드베이스에서 협업. 각자 선호 AI 에이전트가 다를 수 있음:
- 본인: Claude Code (Anthropic Desktop)
- 파트너: 미정 (Antigravity 또는 Codex CLI 가능성)

서로 다른 AI가 동일 파일을 편집할 때 충돌, 스타일 드리프트, 리팩토링 무효화 등 known issues 존재 (Replit 사고, Stormap 분석 참조).

## Decision

### 1. 단일 SSoT (Single Source of Truth)

`AGENTS.md`를 루트에 두고 **모든 에이전트가 첫 로드**. 2026년 사실상 표준 (Anthropic, Google, OpenAI 모두 플래티넘 지원).

에이전트별 파일은 **얇은 스텁**:
- `CLAUDE.md` → AGENTS.md 참조 + Claude 전용 skill 안내
- `GEMINI.md` → AGENTS.md 참조 + Antigravity 전용 디렉토리 안내
- `AGENTS.override.md` → Codex CLI 전용 오버라이드 자리 (현재 비어있음)

### 2. 1 task = 1 branch = 1 worktree = 1 agent

각 에이전트는 자기 worktree에서만 작업. 자세한 내용 `docs/agents/worktree.md`.

### 3. 에이전트 식별 (Co-Authored-By)

커밋마다 트레일러 추가:
- Claude Code: `Co-Authored-By: Claude Code <noreply@anthropic.com>`
- Codex CLI: `Co-Authored-By: Codex CLI <codex@openai.local>`
- Antigravity: `Co-Authored-By: Antigravity <antigravity@google.local>`

### 4. No-Rewrite-of-Recent-Files 룰

다른 에이전트가 24시간 내 수정한 파일을 또 수정할 때:
1. `git log -1 --pretty=format:'%an %ar' <file>`로 직전 수정자 확인
2. PR 본문에 변경 사유 명시
3. 핸드오프 가능하면 원작자에게 위임

### 5. ADR 우선 작성

새 의존성, DB 스키마 변경, RLS 정책 변경, 외부 API 추가는 **ADR 1줄 이상** 먼저 작성.

### 6. Pre-Push 강제

`pnpm lint && pnpm typecheck && pnpm test` 통과 전 push 차단 (Husky pre-push).

### 7. 룰 자체의 진화

AGENTS.md 변경은 양쪽 개발자 review 필수 (CODEOWNERS로 강제).

## Consequences

### Positive

- 에이전트 무관 동일 동작 보장
- 충돌 시 책임 추적 가능 (Co-Authored-By로 grep)
- 새 에이전트 추가가 쉬움 (스텁 1개만)
- 사고 발생 시 ADR + 커밋 히스토리로 원인 추적

### Negative

- 룰 학습 곡선 (특히 파트너 onboarding 시)
- AGENTS.md 길어지면 토큰 비용 증가 — 100-300줄 권장
- 에이전트별 미묘한 차이는 여전히 존재 (예: Antigravity의 `.agent/workflows/`)

## Alternatives Considered

### A. Lockfile-only 협업 (룰 문서 없음)

- 장: 부담 0
- 단: 코드 스타일 드리프트, 모르고 같은 파일 동시 수정, 리팩토링 무효화 가능성 ↑↑
- **거부**

### B. 단일 에이전트 강제 (예: 둘 다 Claude Code만)

- 장: 통일성
- 단: 파트너 선호 무시. 도구 다양성 무력화.
- **거부**

### C. 에이전트별 분리된 폴더 (예: Claude → src/, Codex → docs/)

- 장: 충돌 절대 없음
- 단: 모듈 경계가 도구로 정의되는 게 이상. 작업 분배 비효율.
- **거부**

## References

- [agents.md 표준 사이트](https://agents.md/)
- [HumanLayer — Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Replit AI 사고 (Gizmodo)](https://gizmodo.com/replits-ai-agent-wipes-companys-codebase-during-vibecoding-session-2000633176)
- [Justin Poehnelt — Agent Identity for Git Commits](https://justin.poehnelt.com/posts/agent-identity-git-commits/)
- [mahdiyusuf — Why your coding agent keeps undoing your architecture](https://www.mahdiyusuf.com/why-your-coding-agent-keeps-undoing-your-architecture/)
- [Addy Osmani — Code Agent Orchestra](https://addyosmani.com/blog/code-agent-orchestra/)
