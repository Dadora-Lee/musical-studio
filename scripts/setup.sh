#!/usr/bin/env bash
# Musical Studio · Linux/WSL 부트스트래퍼
# 사용법: bash scripts/setup.sh
# AI Agent도 이 스크립트로 자동 셋업 가능 (idempotent)

set -e

echo "================================================="
echo "Musical Studio - WSL/Linux Setup"
echo "================================================="

# 0) prereq check
check_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "[FAIL] $1 미설치"; exit 1; }
}
echo "[1/6] Prereq check..."
check_cmd node
check_cmd pnpm
check_cmd git
check_cmd gh
NODE_VER=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 20 ]; then
  echo "[FAIL] Node $NODE_VER 감지. Node 20+ 필요."
  exit 1
fi
echo "[OK] Node $(node --version), pnpm $(pnpm --version), git $(git --version), gh $(gh --version | head -1)"

# 1) Install deps
echo "[2/6] pnpm install..."
pnpm install

# 2) .env.local 생성 안내
if [ ! -f .env.local ]; then
  echo "[3/6] .env.local 생성 중..."
  cp .env.example .env.local
  echo "[ACTION REQUIRED] .env.local 에 다음 값들을 채우세요:"
  grep -E '^[A-Z_]+=<' .env.local | head -20
  echo "  (위 값들 채우기 전엔 dev server가 정상 동작 안 함)"
else
  echo "[3/6] .env.local 이미 존재 (덮어쓰지 않음)"
fi

# 3) .env/secrets.env 마스터 안내
if [ ! -d .env ]; then
  echo "[4/6] .env/ 디렉토리 없음. 시크릿 마스터 디렉토리 생성..."
  mkdir -p .env
fi

# 4) Husky pre-push hook
if [ -d .husky ]; then
  echo "[5/6] Husky 설치됨"
else
  echo "[5/6] Husky 미설치 — pnpm install이 자동 처리할 것"
fi

# 5) Health check
echo "[6/6] Health check..."
pnpm typecheck 2>&1 | tail -3
echo ""
echo "================================================="
echo "[DONE] 셋업 완료. 다음 단계:"
echo "  1) .env.local 값 채우기"
echo "  2) pnpm dev → http://localhost:3000"
echo "================================================="
