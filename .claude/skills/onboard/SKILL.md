---
name: onboard
description: Automatically set up the dev environment from a fresh repo clone. Use when user provides this repo URL and asks to set up, says "clone and setup", "온보딩", "셋업", "fresh checkout", or is a new partner running their first session. Reads docs/onboarding.html and executes setup steps deterministically.
---

# Onboard (Self-Setup from Fresh Checkout)

대상: **새 파트너 또는 새 머신에서 처음 세팅하는 AI 에이전트**

## 트리거 조건

다음 중 하나:
- 사용자가 `github.com/Dadora-Lee/musical-studio` URL 공유
- "clone and setup", "온보딩", "셋업", "fresh checkout" 키워드
- `pnpm install` 또는 `node` 등이 작동 안 함 → 환경 부재 추정

## 사전 조건 체크

각 단계에서 `command -v <bin>`으로 확인. 없으면 사용자에게 설치 요청.

1. `node --version` ≥ 20
2. `pnpm --version` (없으면 `npm install -g pnpm --prefix ~/.local`)
3. `git --version`
4. `gh --version` (없으면 사용자에게 `winget install --id GitHub.cli`)
5. WSL 사용자: `uname -a`에 "microsoft" 포함 확인
6. Docker: `docker --version`

## 셋업 시퀀스

```bash
# 1. clone (WSL ext4에)
cd ~/projects
git clone https://github.com/Dadora-Lee/musical-studio.git
cd musical-studio

# 2. 의존성
pnpm install

# 3. 환경변수 (사용자가 채울 .env.local 안내)
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "[ONBOARD] .env.local 생성됨. 다음 값들을 채우세요:"
  grep -E '^[A-Z_]+=<' .env.local
fi

# 4. Supabase 로컬 (선택)
read -p "[ONBOARD] Supabase 로컬 스택 실행할까요? (y/N): " yn
if [ "$yn" = "y" ]; then
  pnpm supabase:start
fi

# 5. 개발 서버
read -p "[ONBOARD] dev server 실행할까요? (y/N): " yn
if [ "$yn" = "y" ]; then
  pnpm dev
fi
```

## 사용자 확인이 필요한 항목

다음은 자동화 불가, 사용자에게 안내:

- GitHub Fine-grained PAT 발급
- Supabase 가입 + 프로젝트 + key 확보
- Google Cloud Console OAuth Client + Drive API
- 공유기 포트포워딩 (외부 노출 시)

자세한 내용은 `docs/onboarding.html` 참조.

## 실행 후 검증

```bash
# health checks
curl -s http://localhost:3000/api/health | grep -q '"ok":true' && echo "[ONBOARD] dev server OK" || echo "[ONBOARD] dev server FAIL"
pnpm typecheck && echo "[ONBOARD] typecheck OK" || echo "[ONBOARD] typecheck FAIL"
pnpm test --run --reporter=basic 2>&1 | tail -3
```

## 실패 시

- pnpm install 실패 → `node --version` 다시 확인, Node 20+ 필요
- Supabase start 실패 → Docker 실행 중인지 확인
- dev server port 충돌 → `lsof -i :3000` 후 안내

## See Also

- `docs/onboarding.html` — 사람용 자세한 가이드
- `AGENTS.md` — 프로젝트 규약
