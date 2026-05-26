# SSH 워크플로 (AI 에이전트용)

> dev 서버에 SSH로 접근하는 AI 에이전트 (예: VSCode Remote SSH 위 Codex CLI) 참고용.

## 접속 후 환경

- Host: musicalstudio.freedynamicdns.net (또는 192.168.31.101 — 같은 LAN)
- Port: 2222
- User: soswolf
- 인증: SSH key (Password 비활성화)
- Working dir: `~/projects/musical-studio`
- 로그인 셸: bash (login mode, .bashrc 로드)

## 환경변수

`.bashrc`가 자동으로 다음을 설정:

- `PATH`에 `~/.local/bin` 추가 (pnpm 위치)
- `PNPM_HOME=~/.local/share/pnpm`
- `~/.nvm/...` (nvm)

`.env.local`은 별도 — Next.js dev 시작 시 자동 로드.

## 주요 명령

```bash
# 프로젝트 진입
cd ~/projects/musical-studio

# 최신 main 받기
git pull origin main

# 의존성 동기화 (lockfile 변경 시)
pnpm install

# Dev server
pnpm dev                          # localhost:3000
pnpm dev:host                     # 0.0.0.0:3000 (LAN/DDNS 접근)
pnpm dev:https                    # HTTPS (모바일 마이크)

# 테스트
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e

# Background dev server
nohup pnpm dev --hostname 0.0.0.0 > /tmp/dev.log 2>&1 &
disown
tail -f /tmp/dev.log
```

## Worktree 워크플로 (AI 에이전트 협업)

```bash
cd ~/projects/musical-studio
git worktree add -b ai/<agent>/<task> ../musical-studio-<task> main
cd ../musical-studio-<task>

# 작업...

git push -u origin ai/<agent>/<task>
gh pr create --draft --title "..." --body "..."

# 완료 후
cd ~/projects/musical-studio
git worktree remove ../musical-studio-<task>
```

자세한 내용 `docs/agents/worktree.md` 참조.

## 자동 실행 가능 명령 (sudoers NOPASSWD)

다음은 사용자 확인 없이 실행 가능:

- `sudo apt-get install <pkg>` — 패키지 설치
- `sudo apt-get update`
- `sudo service ssh restart/start/stop/status`
- `sudo systemctl ssh*`
- `sudo /usr/local/bin/mkcert`
- `sudo ssh-import-id ...`

광범위한 sudo 권한은 여전히 금지. AGENTS.md Safety Rules 참조.

## 동시 접속 시 주의

여러 AI 에이전트가 SSH 동시 접속 가능. 같은 worktree를 두 에이전트가 동시 수정 금지. 각자 자기 worktree 생성.

## 로그 위치

| 로그 | 경로 |
|---|---|
| Next.js dev | `/tmp/dev.log` (background 시) |
| SSH | `/var/log/auth.log` (sudo 필요) |
| Supabase | `~/.supabase/...` |
| Husky pre-push | stderr |

## 종료 시 cleanup

```bash
# Background dev server 종료
pkill -f "next dev"
pkill -f "next-server"

# Supabase 종료
pnpm supabase:stop
```
