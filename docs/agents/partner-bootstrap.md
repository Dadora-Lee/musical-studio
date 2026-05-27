# Partner Bootstrap — AI Agent 자동 합류 가이드

> **대상**: 공동 개발자(파트너)의 AI Agent (Claude Code / Antigravity / Codex CLI).
> **상황**: Partner는 이미 GitHub collaborator로 초대됨. 자기 PC에 musical-studio 기존 작업물이 있을 수도 있음. 본 문서를 그대로 따라 합류 완료.

---

## 0. 사전 조건 (Partner가 직접 했어야 함 — `docs/PARTNER_ONBOARDING.html` 1-3번)

다음이 모두 완료되어 있어야 진행 가능:

- [ ] GitHub 계정 본인 것 + collaborator 초대 수락 (이메일 또는 `https://github.com/Dadora-Lee/musical-studio/invitations`)
- [ ] **Fine-grained PAT 발급** (Contents/Administration/PR/Issues=RW, Metadata=R, 90일)
- [ ] **SSH key**: github.com → Settings → SSH and GPG keys에 본인 공개키 등록
- [ ] 본인 PC 사전 도구: Node 20+, pnpm, git, gh CLI, (Windows) WSL2

준비 안 됐다면 `docs/PARTNER_ONBOARDING.html`로 안내. 모두 됐다면 아래 진행.

---

## 1. 본인 기존 작업물 처리 결정

**먼저 partner에게 물어볼 것**:
> "기존에 musical-studio 관련해서 작업한 코드/문서가 있나요? 있다면 어디에 있나요?"

답변에 따라 분기:

### A. 기존 작업물 없음
→ 단순 clone 진행. 섹션 2부터.

### B. 기존 작업물 있음 (다른 디렉토리, git init 안 됨)
→ 우리 repo clone 후 새 branch에 partner의 작업물 카피해서 commit. 섹션 2 + 3.

### C. 기존 작업물 있고 자체 git repo로 작업 중
→ 우리 repo를 new remote로 추가, partner branch로 push, PR로 통합. 섹션 2 + 4.

---

## 2. 우리 Repo Clone + gh 인증

### 2-1. WSL ext4로 진입 (Windows partner면)
```bash
# Linux/macOS partner는 ~/projects/ 로
# Windows partner는 WSL2 안에서:
cd ~/projects        # 없으면 mkdir -p ~/projects && cd ~/projects
```

### 2-2. gh CLI 인증 (HTTPS + PAT 방식 — owner와 동일)
```bash
gh --version    # 미설치면 owner와 동일하게 winget/apt 설치 후 진행

# Partner의 PAT을 stdin으로 안전하게 전달
read -s PAT     # PAT 입력 (화면에 표시 안 됨, 한 줄 enter)
echo "$PAT" | gh auth login --hostname github.com --git-protocol https --with-token
unset PAT

# 검증
gh auth status   # → "Logged in to github.com account <partner-username>"
gh auth setup-git   # git push 자동 인증
```

### 2-3. Clone
```bash
git clone https://github.com/Dadora-Lee/musical-studio.git
cd musical-studio
```

### 2-4. 본인 git identity 설정
```bash
git config user.name "<partner-github-username>"
git config user.email "<partner-email>"
```

---

## 3. 시나리오 B — 별도 디렉토리 작업물 통합

Partner가 위치 알려준 경로(예: `~/old-work/musical-studio/`)에서:

```bash
# 우리 repo에 새 worktree 생성
cd ~/projects/musical-studio
git worktree add -b ai/<agent>/partner-initial-work ../musical-studio-partner-initial main
cd ../musical-studio-partner-initial

# partner의 작업물 카피 (단, 우리 main과 충돌할 수 있는 부분 주의)
# 안전: 파일 단위로 검토 후 카피
PARTNER_OLD=~/old-work/musical-studio    # 실제 경로로 변경

# 예시: src/ 디렉토리만 카피 (구체적 파일 정리는 사람 결정)
# rsync -avn --exclude='node_modules' --exclude='.next' --exclude='.env*' \
#   "$PARTNER_OLD/" ./
# (-n은 dry-run. 검토 후 -n 제거하고 실행)

# 카피 후 우리 룰에 맞게 정리 (lint/typecheck 통과 확인)
pnpm install
pnpm typecheck && pnpm lint && pnpm test
```

**중요**: 한 번에 commit하지 말고 논리적 단위로 분리해서 commit. 우리 main과 conflict 있으면 PR 단위로 해결.

```bash
git add <files>
git commit -m "feat(partner): import initial work from old directory

Co-Authored-By: <Agent Name> <agent@email>"
git push -u origin ai/<agent>/partner-initial-work
gh pr create --draft --title "WIP: partner initial work" \
  --body "기존 작업물 통합. 리뷰 후 main 머지."
```

---

## 4. 시나리오 C — 자체 git repo가 있는 경우

```bash
# Partner의 기존 repo에서
cd ~/old-work/musical-studio    # partner의 기존 repo

# 우리 repo를 new remote로
git remote add upstream https://github.com/Dadora-Lee/musical-studio.git
git fetch upstream

# 새 branch를 main 기반으로 만들어 partner 작업을 cherry-pick 또는 머지
git checkout -b ai/<agent>/partner-initial-work upstream/main

# partner의 본인 branch에서 의미있는 커밋들 cherry-pick
# git log <partner-branch>로 commit 검토 후
git cherry-pick <commit-hash>
# 또는 squash:
# git merge --squash <partner-branch>
# git commit -m "feat(partner): import initial work (squashed)"

# 충돌 발생 시 — 사람 결정 필요. Partner와 상의.

# 검증
pnpm install && pnpm typecheck && pnpm lint && pnpm test

# Push 후 PR
git push -u upstream ai/<agent>/partner-initial-work
gh pr create --draft --title "WIP: partner initial work"
```

---

## 5. 시크릿 받기 (SSH SCP from dev server)

Owner의 dev server에 시크릿이 있음. Partner의 GitHub SSH 공개키는 이미 owner authorized_keys에 등록됨 (partner-onboard.sh로 자동 처리). 따라서:

```bash
cd ~/projects/musical-studio
mkdir -p .env

# Dev server에서 secrets.env scp
scp -P 2222 soswolf@musicalstudio.freedynamicdns.net:~/projects/musical-studio/.env/secrets.env .env/secrets.env

# client_secret.json도 함께
scp -P 2222 soswolf@musicalstudio.freedynamicdns.net:~/projects/musical-studio/.env/client_secret.json .env/client_secret.json

# 검증: gitignored 확인
git check-ignore .env/secrets.env && echo "[OK] gitignored" || echo "[FAIL]"

# .env.local 자동 생성
bash scripts/sync-env.sh
```

**문제 발생 시**:
- "Permission denied (publickey)" → partner가 github.com에 SSH key 등록 안 했거나, owner가 ssh-import-id 미처리. Owner에게 문의.
- "Connection refused" → dev server 꺼져있음 또는 공유기 포트포워딩 미설정. Owner에게 문의.

대안 (SCP 안 될 때): Owner가 Bitwarden/1Password로 `.env/secrets.env` 텍스트 직접 공유. Partner가 메모장으로 붙여넣기.

---

## 6. 의존성 + 검증

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

모두 통과해야 다음 단계로.

---

## 7. Dev Server 동작 확인

```bash
# 본인 PC에서 dev server (localhost)
pnpm dev

# 다른 터미널에서 health check
curl http://localhost:3000/api/health
# → {"ok":true,...}
```

추가로 owner dev server 접속도 확인:
```bash
# 같은 LAN: 192.168.31.101:3000
# 다른 LAN: musicalstudio.freedynamicdns.net:3000
DEV_TOKEN=$(grep ^DEV_ACCESS_TOKEN= .env.local | cut -d= -f2)
curl "http://musicalstudio.freedynamicdns.net:3000/api/health?token=$DEV_TOKEN"
```

---

## 8. 첫 작업 PR

```bash
# 작업 worktree (선택, 작은 작업이면 main에서 바로)
git worktree add -b ai/<agent>/<task-name> ../musical-studio-<task> main
cd ../musical-studio-<task>

# 코딩 + 테스트 + 커밋
git commit -m "feat(<scope>): <desc>

Co-Authored-By: <Agent Name> <agent@email>"

# pre-push hook이 lint+typecheck+test 자동 실행. 통과 후 push.
git push -u origin ai/<agent>/<task-name>
gh pr create --draft --title "WIP: <desc>" --body "..."
```

---

## 9. 막힌 부분이 있을 때

- AI Agent가 처리 불가능한 작업 (PAT 발급, SSH key 등록, 사람 결정 필요한 charging) → Partner에게 **`docs/PARTNER_ONBOARDING.html` 시각적 가이드를 따라달라고 안내**.
- 시나리오 B/C에서 코드 충돌이 복잡 → Owner에게 문의 (페어 디버깅 위해 SSH 접속 옵션).

---

## 10. 합류 완료 체크리스트

- [ ] `gh auth status` → Partner username 활성
- [ ] `git config user.name/email` → 본인 정보
- [ ] `~/projects/musical-studio` 존재 + `.env/secrets.env` 있음
- [ ] `pnpm typecheck && pnpm test` 모두 PASS
- [ ] `pnpm dev` → http://localhost:3000/api/health 응답
- [ ] (시나리오 B/C) Partner 기존 작업물 PR 생성됨

모두 OK면 **합류 완료**. `docs/agents/dev-workflow.md` 참조해서 일상 워크플로 진행.

---

## 참조 문서

- `docs/agents/dev-workflow.md` — Local-First 워크플로 (필수)
- `docs/agents/collaborator-roles.md` — Owner vs Partner 책임
- `docs/agents/worktree.md` — git worktree 사용법
- `docs/agents/ssh-workflow.md` — SSH 접속 (옵션)
- `docs/testing.md` — 테스트 전략
- `AGENTS.md` — 프로젝트 SSoT
- `CONTEXT.md` — 음악 도메인 용어
