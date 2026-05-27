# Partner Bootstrap — AI Agent 자동 합류 가이드

> **대상**: 공동 개발자(Partner)의 AI Agent (Claude Code / Antigravity / Codex CLI).
> **상황**: Partner는 이미 GitHub collaborator로 초대됨. 본 문서를 따라 자동 합류.

---

## 0. 사전 조건 (Partner 본인이 직접 해야 함 — `docs/PARTNER_ONBOARDING.html` Step 1-5)

다음이 모두 완료되어 있어야 진행 가능:

- [ ] GitHub 초대 수락 (메일에서 또는 `https://github.com/Dadora-Lee/musical-studio/invitations`)
- [ ] **Fine-grained PAT 발급** (Contents/Administration/PR/Issues=RW, Metadata=R, 90일)
- [ ] **SSH key**: github.com → Settings → SSH and GPG keys에 본인 공개키 등록
- [ ] **Owner에게 "SSH key 등록 완료" 알림** → Owner가 `ssh-import-id gh:<partner>` 재실행 확인
- [ ] Windows 사용자면 WSL2 Ubuntu-24.04 설치 완료 (macOS/Linux는 SKIP)

준비 안 됐다면 → Partner에게 `docs/PARTNER_ONBOARDING.html`로 안내하고 멈춤. 모두 됐다면 아래 진행.

---

## 1. Partner 정보 확인 + 기존 작업물 처리 결정

Partner가 알려준 정보를 변수에 저장:

- `PARTNER_USERNAME` (예: jieun0610)
- `PARTNER_EMAIL`
- `PARTNER_PAT` (gh auth login에 stdin으로만 사용, echo 금지)
- `OS_TYPE` = `windows-wsl` / `macos` / `linux`
- `PARTNER_OLD_WORK` = 기존 musical-studio 경로 또는 `"없음"`

### 기존 작업물 시나리오 분기

| 시나리오 | 처리 |
|---|---|
| **A. 없음** | 단순 clone 진행. 섹션 3부터. |
| **B. 별도 디렉토리, git init 안 됨** | clone + 새 branch에 파일 카피해서 commit. 섹션 3 + 4. |
| **C. 자체 git repo로 작업 중** | 우리 repo를 upstream으로 추가, partner branch로 push, PR로 통합. 섹션 3 + 5. |

---

## 2. 개발 환경 준비 (OS별 분기)

### 2-A. Windows + WSL2 사용자

Partner가 WSL2를 이미 설치한 상태로 가정 (안 되어 있으면 `PARTNER_ONBOARDING.html` Step 2-A 참조하라고 안내).

WSL Ubuntu 터미널 진입 (Windows에서 `wsl -d Ubuntu-24.04`) 후 아래 명령 진행.

**모든 작업은 WSL ext4에서**:
```bash
cd ~       # /home/<partner-user>/
mkdir -p ~/projects
cd ~/projects
```

절대 `/mnt/c/` 아래에 두지 말 것. NTFS 9P 오버헤드로 HMR 10배 느림.

### 2-B. macOS / Linux 사용자

```bash
mkdir -p ~/projects
cd ~/projects
```

### 2-C. 필수 도구 설치 (모든 OS 공통)

설치 확인:
```bash
node --version  # 20+ 필요
pnpm --version  # 9+ 필요 (없으면 아래)
git --version   # 2.40+
gh --version    # 2.40+
```

#### Node 20+ 설치 (없으면)

**WSL Ubuntu**:
```bash
# nvm 권장
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 22
nvm use 22
```

**macOS**:
```bash
brew install node@22
```

#### pnpm 설치 (없으면)

```bash
npm config set prefix ~/.local
npm install -g pnpm

# PATH 추가 (~/.bashrc 또는 ~/.zshrc)
case ":$PATH:" in
  *":$HOME/.local/bin:"*) ;;
  *) export PATH="$HOME/.local/bin:$PATH" ;;
esac

~/.local/bin/pnpm --version
```

#### gh CLI 설치 (없으면)

**WSL/Linux**:
```bash
sudo apt-get update
sudo apt-get install -y gh
```

**macOS**:
```bash
brew install gh
```

---

## 3. gh CLI 인증 (PAT 사용) + Repo Clone

### 3-1. gh 인증 (HTTPS + PAT)

PAT는 stdin으로만 전달, 절대 echo 금지:

```bash
read -s PAT
# Partner가 PAT 붙여넣고 Enter

echo "$PAT" | gh auth login --hostname github.com --git-protocol https --with-token
unset PAT

gh auth status
gh auth setup-git
```

### 3-2. Clone

```bash
cd ~/projects
git clone https://github.com/Dadora-Lee/musical-studio.git
cd musical-studio
```

### 3-3. 본인 git identity 설정

```bash
git config user.name "$PARTNER_USERNAME"
git config user.email "$PARTNER_EMAIL"
```

---

## 4. 시나리오 B — 별도 디렉토리 작업물 통합

```bash
PARTNER_OLD=$PARTNER_OLD_WORK

cd ~/projects/musical-studio
git worktree add -b ai/<agent-name>/partner-initial-work ../musical-studio-partner-initial main
cd ../musical-studio-partner-initial

# dry-run 먼저
rsync -avn --exclude='node_modules' --exclude='.next' --exclude='.env*' \
  --exclude='.git' --exclude='dist' --exclude='out' \
  "$PARTNER_OLD/" ./

# Partner와 검토 후 실제 카피
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.env*' \
  --exclude='.git' --exclude='dist' --exclude='out' \
  "$PARTNER_OLD/" ./

pnpm install
pnpm typecheck && pnpm lint && pnpm test

git add <files>
git commit -m "feat(partner): import initial work from old directory"
git push -u origin ai/<agent-name>/partner-initial-work
gh pr create --draft --title "WIP: partner initial work"
```

---

## 5. 시나리오 C — 자체 git repo가 있는 경우

```bash
cd $PARTNER_OLD_WORK

git remote add upstream https://github.com/Dadora-Lee/musical-studio.git
git fetch upstream

git checkout -b ai/<agent-name>/partner-initial-work upstream/main

# Partner의 본인 branch의 의미 있는 commit cherry-pick
git log <partner-branch>
git cherry-pick <commit-hash>

pnpm install && pnpm typecheck && pnpm lint && pnpm test

git push -u upstream ai/<agent-name>/partner-initial-work
gh pr create --draft --title "WIP: partner initial work" --repo Dadora-Lee/musical-studio
```

---

## 6. 시크릿 받기 (SSH SCP from dev server)

**전제**: Partner SSH key가 owner authorized_keys에 등록되어 있어야 함 (사전 조건 4번).

```bash
cd ~/projects/musical-studio
mkdir -p .env

scp -P 2222 soswolf@musicalstudio.freedynamicdns.net:~/projects/musical-studio/.env/secrets.env .env/secrets.env
scp -P 2222 soswolf@musicalstudio.freedynamicdns.net:~/projects/musical-studio/.env/client_secret.json .env/client_secret.json

ls -la .env/
git check-ignore .env/secrets.env && echo "[OK] gitignored" || echo "[FAIL]"

bash scripts/sync-env.sh
```

### 문제 발생 시

- **`Permission denied (publickey)`** → 사전 조건 4번 미충족. Partner에게 "Owner에게 SSH key 등록 완료 알림 + Owner가 `ssh-import-id` 재실행했는지 확인" 요청. 멈춤.
- **`Connection refused`** → Owner dev server SSH 다운 또는 공유기 포트포워딩 미설정.
- **대안**: Owner가 Bitwarden/1Password로 `.env/secrets.env` 텍스트 공유.

---

## 7. 의존성 + 검증

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

모두 통과해야 다음 단계로.

---

## 8. Dev Server 동작 확인

```bash
pnpm dev
curl http://localhost:3000/api/health

DEV_TOKEN=$(grep ^DEV_ACCESS_TOKEN= .env.local | cut -d= -f2)
curl "http://musicalstudio.freedynamicdns.net:3000/api/health?token=$DEV_TOKEN"
```

---

## 9. 첫 작업 PR (선택)

```bash
cd ~/projects/musical-studio
git worktree add -b ai/<agent-name>/<task-name> ../musical-studio-<task> main
cd ../musical-studio-<task>

git add <files>
git commit -m "feat(<scope>): <desc>"

git push -u origin ai/<agent-name>/<task-name>
gh pr create --draft
```

---

## 10. AI Agent가 멈춰야 하는 경우

- 사전 조건 미충족 (PAT/SSH/초대 수락)
- 시나리오 B/C에서 코드 충돌
- 기존 작업물 카피 시 .env/secret 의심 파일 발견
- pnpm install/test 실패
- SSH SCP 실패

AI Agent는 자체적으로 다음 작업 금지:
- `.env/secrets.env` 또는 `client_secret.json` 직접 수정
- `--no-verify` 또는 hook 우회
- main 브랜치 직접 push (PR 통해서만)
- Owner의 인프라 (Supabase 마이그레이션, RLS 정책) 변경

---

## 11. 합류 완료 체크리스트

- [ ] `gh auth status` → Partner username 활성
- [ ] `git config user.name/email` → 본인 정보
- [ ] `~/projects/musical-studio` 존재 + `.env/secrets.env` 있음 (gitignored 확인)
- [ ] `pnpm typecheck && pnpm test` 모두 PASS
- [ ] `pnpm dev` → http://localhost:3000/api/health 응답 OK
- [ ] Owner dev server `/api/health` 응답 OK
- [ ] (시나리오 B/C) Partner 기존 작업물 draft PR 생성됨

모두 OK면 합류 완료. 일상 워크플로 진입:

→ `docs/agents/dev-workflow.md` (Local-First) 정독
→ `docs/agents/worktree.md` 워크플로 익히기
→ `AGENTS.md` SSoT + `CONTEXT.md` 용어집 확인

---

## 참조 문서

- `docs/agents/dev-workflow.md` — Local-First 워크플로 (필수)
- `docs/agents/collaborator-roles.md` — Owner vs Partner 책임
- `docs/agents/worktree.md` — git worktree 사용법
- `docs/agents/ssh-workflow.md` — SSH 접속 (옵션)
- `docs/testing.md` — 테스트 전략
- `AGENTS.md` — 프로젝트 SSoT
- `CONTEXT.md` — 음악 도메인 용어
- `docs/PARTNER_ONBOARDING.html` — Partner 본인용 시각 가이드
