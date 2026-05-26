# CLAUDE.md

**See `AGENTS.md` for the project SSoT. All conventions, rules, and tech stack live there.**

## Claude Code-Specific Additions

- 활용 가능한 skill 4종: `.claude/skills/{tdd,diagnose,zoom-out,grill-me}/`
- `.claude/settings.local.json`은 gitignore. 본인 PC 전용 설정만.
- `gh` CLI 사용 가능 (Dadora-Lee 인증됨). 통합 터미널에서 직접 호출.
- Plan mode 적극 활용: 큰 변경 전 `ExitPlanMode`로 계획 제시 후 진행.
- TodoWrite 활용: 4단계 이상 작업은 TaskCreate로 트래킹.

## Skill 트리거 키워드

- `/tdd` 또는 "TDD로", "red-green-refactor" → tdd 스킬
- `/diagnose` 또는 "디버깅", "버그 재현" → diagnose 스킬
- `/zoom-out` 또는 "이 영역 잘 모르겠어" → zoom-out 스킬
- `/grill-me` 또는 "요구사항 명확히" → grill-me 스킬

## 통합 터미널 환경

- 셸: Windows 호스트의 Git Bash 또는 PowerShell
- 실제 개발 작업은 WSL2 (`wsl bash -c '...'` 또는 `wsl bash` 진입)
- 코드 위치: `/home/soswolf/projects/musical-studio` (WSL ext4)
- 시크릿: `.env/secrets.env` (gitignored)
