# CLAUDE.md

**See `AGENTS.md` for the project SSoT. All conventions, rules, and tech stack live there.**

> **첫 로드 시 필수 읽기 순서**: `AGENTS.md` → `CONTEXT.md` → `docs/agents/dev-workflow.md` → `docs/agents/collaborator-roles.md`.
> 사용자 글로벌 메모리: `~/.claude/CLAUDE.md` (식별 정보 및 환경 결정사항).

## Claude Code-Specific Additions

- 활용 가능한 skill 5종: `.claude/skills/{tdd,diagnose,zoom-out,grill-me,onboard}/`
- `.claude/settings.local.json`은 gitignore. 본인 PC 전용 설정만.
- `gh` CLI 사용 가능 (Dadora-Lee 인증됨). 통합 터미널에서 직접 호출.
- Plan mode 적극 활용: 큰 변경 전 `ExitPlanMode`로 계획 제시 후 진행.
- TodoWrite/TaskCreate 활용: 4단계 이상 작업은 트래킹.

## Skill 트리거 키워드

- `/tdd` 또는 "TDD로", "red-green-refactor" → tdd 스킬
- `/diagnose` 또는 "디버깅", "버그 재현" → diagnose 스킬
- `/zoom-out` 또는 "이 영역 잘 모르겠어" → zoom-out 스킬
- `/grill-me` 또는 "요구사항 명확히" → grill-me 스킬
- `/onboard` 또는 "셋업", "fresh checkout" → onboard 스킬

## 통합 터미널 환경

- 셸: Windows 호스트의 Git Bash 또는 PowerShell
- 실제 개발 작업은 WSL2 (`wsl bash -lc '...'` — login shell로 PATH 정상)
- 코드 위치: `/home/soswolf/projects/musical-studio` (WSL ext4)
- 시크릿: `.env/secrets.env` (gitignored, 마스터) → `scripts/sync-env.sh` → `.env.local` (auto)
- ⚠ `wsl bash -c "$VAR"` 사용 금지 — Windows PATH 괄호 때문에 syntax error. 단일 따옴표 또는 `-lc` 사용.

## 워크플로 결정 (메모)

- **Local-First**: 둘 다 자기 PC에서 코딩. dev server (WSL @ owner PC)는 통합 테스트/QA/모바일/데모 전용.
- Pre-push hook: lint + typecheck + test 강제. `--no-verify` 우회 금지.
- 다른 에이전트가 24h 내 수정한 파일을 또 수정할 때는 PR 본문에 이유 명시.

## 자동화 스크립트 위치

- `scripts/sudo-bootstrap.sh` — sudo 1회 자동화 (SSH/Playwright/mkcert)
- `scripts/sync-env.sh` — secrets.env → .env.local
- `scripts/partner-onboard.sh <username>` — 신규 파트너 합류 자동화

## 사용자 글로벌 메모리

`C:\Users\7H9Z1\.claude\CLAUDE.md`에 식별/환경 정보 저장됨. 새 세션 시작 시 자동 로드됨.
