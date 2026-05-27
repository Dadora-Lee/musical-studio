# AI 에이전트 협업 조율 시스템

> 2명의 개발자가 각자 다른 AI 에이전트(Claude Code / Antigravity / Codex CLI)를 사용해 같은 repo에서 비동기 협업하는 환경. GitHub native 파일 기반 — 외부 서비스 0개, 모든 history는 git commit으로 영구 보존.

## 채택 근거 (2026년 5월)

조사 결과 2026년 사실상 표준은 **AGENTS.md (Linux Foundation, 60,000+ 채택) + `.agent-log/` GitHub Actions auto-commit** 패턴. 본 프로젝트는 이 패턴을 채택하되 폴더를 3개로 분리:

| 폴더 | 용도 | 작성 주체 | 빈도 |
|---|---|---|---|
| `docs/agent-log/` | 일일 변경 요약 | **GitHub Actions** (자동) | push마다 |
| `docs/agent-handoff/` | 인수인계 (미해결/해결) | AI 에이전트 (수동) | 필요 시 |
| `docs/agent-decisions/` | 가벼운 architectural 결정 | AI 에이전트 (수동) | 필요 시 |

큰 결정은 여전히 `docs/adr/` (정식 ADR).

## 자동 흐름

```
[Dev A push to main]
      ↓
[GitHub Actions: agent-context-update.yml]
      ↓
[GitHub Models AI inference: 변경 요약]
      ↓
[docs/agent-log/YYYY-MM-DD.md에 append + commit-back]
      ↓
[Dev B의 AI 에이전트 다음 세션 시작 시 git pull → 자동 인지]
```

## AI 에이전트 세션 시작 체크리스트 (필수)

세션 시작할 때마다 다음 5단계를 수행:

```bash
cd ~/projects/musical-studio
git pull --rebase origin main

# 1. SSoT
cat AGENTS.md | head -50           # 또는 grep 필요한 섹션

# 2. 오늘 로그
TODAY=$(date -u +%Y-%m-%d)
cat docs/agent-log/${TODAY}.md 2>/dev/null || echo "(오늘 로그 없음)"

# 3. 직전 1~2일 로그 (흐름 파악)
ls -1 docs/agent-log/*.md 2>/dev/null | grep -v README | tail -3

# 4. 미해결 handoff (반드시 확인)
ls docs/agent-handoff/open/ 2>/dev/null | grep -v gitkeep

# 5. 최근 결정
ls -1 docs/agent-decisions/*.md 2>/dev/null | grep -v README | tail -3
```

## AI 에이전트 세션 종료 체크리스트

1. **미해결 작업이 있으면** → `docs/agent-handoff/open/YYYY-MM-DD-<slug>.md` 작성
2. **새 architectural 결정 있으면** → `docs/agent-decisions/YYYY-MM-DD-<slug>.md` 작성
3. **CONTEXT.md 용어집 변경 필요하면** → 함께 commit
4. **commit message에 `Co-Authored-By: <Agent Name>` trailer 포함**
5. `git push` (또는 PR draft)

`docs/agent-log/`는 자동 — agent가 직접 쓰지 말 것.

## Handoff 작성 시점

다음 중 하나라도 해당하면 작성:

- 시작했는데 마무리 못 한 작업
- 권한 부족 blocker (Owner만 가능한 작업 — Supabase RLS, OAuth secret rotation 등)
- 의도적 미완성 (backend stub만, frontend 다른 agent가)
- 다른 agent에게 알려야 할 side effect (API 변경, 신규 의존성 등)

→ `docs/agent-handoff/README.md` 템플릿 참조.

## Decision 작성 시점

- 새 라이브러리 도입 (가벼운 경우)
- naming convention 결정 (CONTEXT.md 미반영 항목)
- 작은 아키텍처 패턴 정착
- 회피한 접근 + 이유

→ `docs/agent-decisions/README.md` 템플릿 참조.

큰 결정 (DB 스키마, Auth/RLS, 새 외부 의존성, 라이선스)은 `docs/adr/`.

## GitHub Actions 워크플로

`.github/workflows/agent-context-update.yml`:

- **트리거**: main 브랜치 push (단, `docs/agent-log/`, `docs/agent-handoff/`, `docs/agent-decisions/` 변경은 제외 — 무한 루프 방지)
- **AI 모델**: GitHub Models (`openai/gpt-4o-mini`) — 무료, 외부 API key 불필요
- **권한**: `contents: write` + `models: read`
- **결과**: `docs/agent-log/YYYY-MM-DD.md`에 append + bot commit-back
- **동시성**: `agent-context-update` 그룹 순차 처리 → 로그 인터리브 방지
- **무한 루프 방지**: 봇이 만든 commit은 자기 자신 트리거 안 함 (paths-ignore + `stefanzweifel/git-auto-commit-action`이 새 workflow 시작 안 함)

## Conventional Commits + Agent Trailer

브랜치명: `ai/<agent>/<scope>-<desc>` (예: `ai/claude/feat-osmd-pitch`)

commit message:
```
<type>(<scope>): <subject>

<body — what & why>

Co-Authored-By: Claude Code <noreply@anthropic.com>
```

에이전트별 trailer:
- Claude Code: `Co-Authored-By: Claude Code <noreply@anthropic.com>`
- Codex CLI: `Co-Authored-By: Codex CLI <codex@openai.local>`
- Antigravity: `Co-Authored-By: Antigravity <antigravity@google.local>`

## 트러블슈팅

### Workflow가 안 돌아감
- Actions tab 확인: https://github.com/Dadora-Lee/musical-studio/actions
- `models: read` 권한이 organization 설정에서 막혀있을 수 있음 (개인 repo는 기본 OK)
- 또는 GitHub Models가 rate limit (1시간 단위 제한 있음)

### AI 요약이 이상함
- GitHub Models의 gpt-4o-mini는 가벼운 모델. 큰 변경에는 가끔 빈약함.
- 더 좋은 요약 원하면: workflow에서 model을 `openai/gpt-4o`로 교체 (rate limit 다름)
- 또는 ANTHROPIC_API_KEY를 secret 등록 후 Anthropic API로 fallback

### Bot commit이 main 보호 규칙 위반?
- main에는 PR + 1 approval이 강제됨
- Actions 봇은 enforce_admins=false 덕에 `Bypassed rule violations`로 직접 push 가능
- 위험하면 워크플로를 `docs/agent-log/` 전용 branch에 push + 별도 sync 메커니즘으로 변경 가능 (현재 비추 — 단순함이 우선)

## 참조

- AGENTS.md (SSoT)
- docs/agent-log/ (자동 생성 로그)
- docs/agent-handoff/README.md (인수인계 프로토콜)
- docs/agent-decisions/README.md (결정 기록 프로토콜)
- docs/adr/ (정식 ADR)
