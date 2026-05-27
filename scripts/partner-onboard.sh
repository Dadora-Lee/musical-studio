#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# Musical Studio · 신규 파트너 합류 자동화 (Owner 1회 실행)
#
# 사용법: bash scripts/partner-onboard.sh <partner-github-username>
#
# 수행:
#   1) GitHub repo collaborator로 초대 (write 권한)
#   2) Owner WSL의 ~/.ssh/authorized_keys에 파트너 GitHub SSH key 추가
#   3) CODEOWNERS 파일 업데이트
#   4) 결과 안내 + 파트너에게 전달할 정보 출력
# ═══════════════════════════════════════════════════════════════════
set -e

PARTNER="${1:-}"
if [ -z "$PARTNER" ]; then
  echo "사용법: bash $0 <partner-github-username>"
  exit 1
fi

OWNER="Dadora-Lee"
REPO="musical-studio"

C_GREEN='\033[0;32m'; C_BLUE='\033[0;34m'; C_NC='\033[0m'
log() { echo -e "${C_BLUE}[partner-onboard]${C_NC} $*"; }
ok()  { echo -e "${C_GREEN}[OK]${C_NC} $*"; }

# ─── 1) GitHub collaborator 초대 ─────────────────────────────────
log "[1/3] GitHub collaborator 초대: $PARTNER"
if gh api --method PUT "/repos/$OWNER/$REPO/collaborators/$PARTNER" -f permission=push 2>&1 | tail -3; then
  ok "초대 완료 (파트너 이메일로 invite 발송됨)"
fi

# ─── 2) SSH key import ───────────────────────────────────────────
log "[2/3] SSH key import (파트너 GitHub 공개키)"
if ssh-import-id "gh:$PARTNER" 2>&1 | tail -3; then
  KEY_COUNT=$(wc -l < ~/.ssh/authorized_keys)
  ok "authorized_keys 현재 $KEY_COUNT 라인"
fi

# ─── 3) CODEOWNERS 업데이트 ──────────────────────────────────────
log "[3/3] CODEOWNERS에 파트너 추가"
CODEOWNERS_FILE="$HOME/projects/musical-studio/CODEOWNERS"
if [ -f "$CODEOWNERS_FILE" ] && ! grep -q "@$PARTNER" "$CODEOWNERS_FILE"; then
  # 라인 끝의 @Dadora-Lee 뒤에 @PARTNER 추가
  sed -i "s|@Dadora-Lee$|@Dadora-Lee @$PARTNER|" "$CODEOWNERS_FILE"
  ok "CODEOWNERS 업데이트됨 (commit 필요)"
else
  log "CODEOWNERS에 이미 추가됨 또는 파일 없음"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ 파트너 합류 자동화 완료"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "다음 단계 (수동):"
echo ""
echo "1️⃣  Google Cloud Console에서 Test users에 파트너 Gmail 추가"
echo "    → https://console.cloud.google.com/auth/audience"
echo "    → Test users → ADD USERS → <파트너 Gmail>"
echo ""
echo "2️⃣  CODEOWNERS commit"
echo "    cd ~/projects/musical-studio"
echo "    git add CODEOWNERS"
echo "    git commit -m 'chore: add @$PARTNER to CODEOWNERS'"
echo "    git push origin main"
echo ""
echo "3️⃣  파트너에게 전달할 자료 (Bitwarden/1Password 공유 권장):"
echo "    - .env/secrets.env 파일 (시크릿 값 포함)"
echo "    - 셋업 가이드 URL: https://github.com/$OWNER/$REPO/blob/main/docs/onboarding.html"
echo "    - 개발 워크플로: https://github.com/$OWNER/$REPO/blob/main/docs/dev-workflow.html"
echo "    - 협업 책임 분리: https://github.com/$OWNER/$REPO/blob/main/docs/collaborator-roles.html"
echo ""
echo "4️⃣  파트너 첫 셋업 명령 (전달):"
echo "    git clone https://github.com/$OWNER/$REPO.git"
echo "    cd $REPO"
echo "    # .env/secrets.env 받은 값으로 채우기"
echo "    bash scripts/sync-env.sh"
echo "    pnpm install"
echo "    pnpm dev"
echo ""
