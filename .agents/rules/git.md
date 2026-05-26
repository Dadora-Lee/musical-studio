# .agents/rules/git.md (Antigravity 호환)

> Git identity + commit conventions. AGENTS.md 보조 문서.

## Author Identity (에이전트별)

각 에이전트는 자기 ID로 commit. WSL 안에서 환경변수 설정:

### Claude Code
```bash
export GIT_AUTHOR_NAME="Dadora-Lee"
export GIT_AUTHOR_EMAIL="dadorasoft@gmail.com"
# 트레일러: Co-Authored-By: Claude Code <noreply@anthropic.com>
```

### Codex CLI
```bash
export GIT_AUTHOR_NAME="Dadora-Lee"
export GIT_AUTHOR_EMAIL="dadorasoft@gmail.com"
# 트레일러: Co-Authored-By: Codex CLI <codex@openai.local>
```

### Antigravity
```bash
export GIT_AUTHOR_NAME="Dadora-Lee"
export GIT_AUTHOR_EMAIL="dadorasoft@gmail.com"
# 트레일러: Co-Authored-By: Antigravity <antigravity@google.local>
```

(파트너 commit은 파트너 이름/메일로 — 파트너 worktree에서 자기 git config 사용)

## Commit Message 템플릿

```
<type>(<scope>): <subject>

<body — what & why, not how. 한국어 OK.>

Co-Authored-By: <Agent Name> <agent@email>
```

## type 분류 (Conventional Commits)

- `feat` — 새 기능
- `fix` — 버그 수정
- `refactor` — 리팩토링 (동작 변화 없음)
- `docs` — 문서만
- `test` — 테스트 추가/수정
- `chore` — 빌드/도구 변경
- `perf` — 성능 개선

## 절대 금지

- `git add .`, `git add -A` ← 시크릿 누출 위험. 특정 파일명만.
- `git push --force` ← 사용자 명시 요청 시만
- `git reset --hard` ← 사용자 명시 요청 시만
- 빈 커밋 메시지

## 좋은 커밋 예시

```
feat(musicxml): add parseRoles to extract Part names

REQ-A-002 본인 배역 필터링을 위한 사전 작업.
.musicxml + .xml 모두 처리. .mxl은 후속 커밋.
샘플 3종으로 테스트.

Co-Authored-By: Claude Code <noreply@anthropic.com>
```
