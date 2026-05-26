# GEMINI.md (Antigravity)

**See `AGENTS.md` for the project SSoT. All conventions, rules, and tech stack live there.**

## Antigravity-Specific Additions

- v1.20.3+ 부터 `AGENTS.md` 네이티브 지원 — `AGENTS.md`가 우선 규칙
- 우선순위: System Rules > GEMINI.md > AGENTS.md > .agent/rules/
- 본 GEMINI.md는 의도적으로 짧음. 모든 룰은 AGENTS.md.

## Antigravity 전용 디렉토리

- `.agents/rules/git.md` — Git identity 및 author 환경변수
- `.agents/rules/safety.md` — 파괴 명령 차단 (rm -rf, DROP TABLE 등)
- `.agents/skills/onboard/SKILL.md` — 새 체크아웃 자동 셋업

## ~/.gemini/ 글로벌 충돌 주의

Gemini CLI를 동시 사용 중이라면 `~/.gemini/GEMINI.md` 충돌 가능 (Issue #16058).
프로젝트 단위 설정만 사용 권장.

## Antigravity 워크플로 슬래시 커맨드

- 자체 정의는 `.agents/workflows/` 에 (필요 시 추후 추가)
