#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# Musical Studio · sudo 자동화 1회 부트스트랩
#
# 사용법: WSL 안에서 한 번만 실행
#   bash scripts/sudo-bootstrap.sh
#   (sudo 비밀번호 1회 입력 → 이후 모든 자동화 가능)
#
# 수행:
#   1) sudoers NOPASSWD 설정 (지정된 명령만)
#   2) openssh-server 설치 + 키 인증 only 설정 (포트 2222)
#   3) Playwright 시스템 라이브러리 설치
#   4) mkcert + libnss3-tools 설치
#   5) ssh-import-id로 GitHub SSH key 자동 등록
#
# 안전성:
#   - NOPASSWD는 특정 명령만 허용 (apt-get, service, mkcert)
#   - SSH는 키 only (password auth 비활성화)
#   - 자세한 내용 docs/agents/local-sudo-setup.md
# ═══════════════════════════════════════════════════════════════════

set -e

# ─── 색상 헬퍼 ──────────────────────────────────────────────────
C_GREEN='\033[0;32m'; C_RED='\033[0;31m'; C_BLUE='\033[0;34m'; C_NC='\033[0m'
log() { echo -e "${C_BLUE}[sudo-bootstrap]${C_NC} $*"; }
ok()  { echo -e "${C_GREEN}[OK]${C_NC} $*"; }
err() { echo -e "${C_RED}[FAIL]${C_NC} $*"; }

USERNAME=$(whoami)
GH_USERNAME="${GH_USERNAME:-Dadora-Lee}"

log "Username: $USERNAME"
log "GitHub username (for SSH key import): $GH_USERNAME"
log "이 스크립트는 sudo 명령을 사용합니다. 비밀번호 1회 입력 예상."
echo ""

# ═══════════════════════════════════════════════════════════════════
# 0) sudo 사전 확인
# ═══════════════════════════════════════════════════════════════════
log "[0/6] sudo 권한 확인..."
sudo -v
ok "sudo 권한 OK"

# ═══════════════════════════════════════════════════════════════════
# 1) sudoers NOPASSWD 설정
# ═══════════════════════════════════════════════════════════════════
log "[1/6] sudoers NOPASSWD 룰 추가..."
SUDOERS_FILE="/etc/sudoers.d/musical-studio-$USERNAME"

sudo tee "$SUDOERS_FILE" > /dev/null <<EOF
# Musical Studio dev automation
# Created by sudo-bootstrap.sh on $(date +%Y-%m-%d)
#
# 다음 명령들만 NOPASSWD. 보안상 광범위한 권한 회피.
$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/apt-get install *
$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/apt-get update
$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/apt-get autoremove
$USERNAME ALL=(ALL) NOPASSWD: /usr/sbin/service ssh *
$USERNAME ALL=(ALL) NOPASSWD: /usr/sbin/service docker *
$USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl ssh*
$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/systemctl ssh*
$USERNAME ALL=(ALL) NOPASSWD: /usr/local/bin/mkcert
$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/ssh-import-id*
EOF
sudo chmod 0440 "$SUDOERS_FILE"
sudo visudo -c -f "$SUDOERS_FILE" > /dev/null
ok "sudoers 룰 추가: $SUDOERS_FILE"

# ═══════════════════════════════════════════════════════════════════
# 2) APT 패키지 설치 (Playwright deps + SSH + mkcert deps)
# ═══════════════════════════════════════════════════════════════════
log "[2/6] APT 패키지 업데이트..."
sudo apt-get update -qq
ok "apt-get update 완료"

log "[2/6] openssh-server + mkcert dep + Playwright deps 일괄 설치..."
sudo apt-get install -y -qq \
  openssh-server \
  libnss3-tools \
  ssh-import-id \
  libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libdrm2 libdbus-1-3 libxkbcommon0 libatspi2.0-0 libx11-6 \
  libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 \
  libgbm1 libpango-1.0-0 libcairo2 libasound2t64
ok "패키지 설치 완료"

# ═══════════════════════════════════════════════════════════════════
# 3) mkcert 설치 (바이너리 다운로드)
# ═══════════════════════════════════════════════════════════════════
if command -v mkcert > /dev/null; then
  ok "mkcert 이미 설치됨 ($(mkcert -version 2>&1 || echo unknown))"
else
  log "[3/6] mkcert 바이너리 다운로드..."
  MKCERT_URL=$(curl -sL https://api.github.com/repos/FiloSottile/mkcert/releases/latest | grep -oE 'https://[^"]+linux-amd64' | head -1)
  curl -sL "$MKCERT_URL" -o /tmp/mkcert
  chmod +x /tmp/mkcert
  sudo mv /tmp/mkcert /usr/local/bin/mkcert
  mkcert -install
  ok "mkcert 설치: $(mkcert -version 2>&1)"
fi

# ═══════════════════════════════════════════════════════════════════
# 4) SSH 서버 설정
# ═══════════════════════════════════════════════════════════════════
log "[4/6] SSH 서버 설정 (포트 2222, 키 인증 only)..."

SSHD_CONFIG="/etc/ssh/sshd_config.d/musical-studio.conf"
sudo tee "$SSHD_CONFIG" > /dev/null <<'EOF'
# Musical Studio dev SSH config
# 보안: 키 인증 only, port 2222 (Windows OpenSSH 22와 충돌 회피)
Port 2222
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
AllowUsers soswolf
EOF
ok "SSH config: $SSHD_CONFIG"

# SSH 디렉토리 준비
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# GitHub SSH key import
log "[4/6] GitHub SSH key import (user: $GH_USERNAME)..."
ssh-import-id "gh:$GH_USERNAME" 2>&1 || log "(GitHub keys import 실패 — github.com에 SSH key 등록 후 재시도 가능)"

# SSH 시작 (WSL2는 systemd 또는 service 사용)
if command -v systemctl > /dev/null && systemctl --version > /dev/null 2>&1; then
  sudo systemctl enable ssh 2>&1 | tail -1 || true
  sudo systemctl restart ssh
else
  sudo service ssh restart
fi

# 검증
sleep 1
if sudo ss -tlnp 2>/dev/null | grep -q ':2222'; then
  ok "SSH 서버 listening on :2222"
else
  err "SSH 서버 시작 실패. sudo service ssh status 확인 필요"
fi

# ═══════════════════════════════════════════════════════════════════
# 5) WSL 자동 시작 SSH 설정 (~/.profile에 추가)
# ═══════════════════════════════════════════════════════════════════
log "[5/6] WSL 시작 시 SSH 자동 실행 설정..."
if ! grep -q "musical-studio ssh autostart" ~/.profile 2>/dev/null; then
  cat >> ~/.profile <<'EOF'

# musical-studio ssh autostart (WSL2 boot시 sshd 자동)
if ! pgrep -x sshd > /dev/null 2>&1; then
  sudo service ssh start > /dev/null 2>&1 &
fi
EOF
  ok "WSL boot시 SSH 자동 시작 등록"
else
  ok "WSL boot autostart 이미 설정됨"
fi

# /etc/wsl.conf에 boot 명령 (WSL2 systemd 환경)
if [ -f /etc/wsl.conf ] && ! grep -q "\[boot\]" /etc/wsl.conf; then
  sudo tee -a /etc/wsl.conf > /dev/null <<EOF

[boot]
command = "service ssh start"
EOF
  ok "/etc/wsl.conf [boot] 추가 (WSL 재시작 시 SSH 자동 시작)"
fi

# ═══════════════════════════════════════════════════════════════════
# 6) 검증 + 다음 단계 안내
# ═══════════════════════════════════════════════════════════════════
log "[6/6] 최종 검증..."
echo ""
echo "─── 결과 ─────────────────────────────────────────────────────"
echo "  sudoers NOPASSWD : $SUDOERS_FILE"
echo "  SSH 서버         : $(sudo ss -tlnp 2>/dev/null | grep -E ':2222\b' | head -1 || echo '시작 안 됨')"
echo "  Playwright deps  : libnspr4 = $(dpkg -l libnspr4 2>/dev/null | tail -1 | awk '{print $3}')"
echo "  mkcert           : $(mkcert -version 2>&1 || echo '미설치')"
echo "  authorized_keys  : $(wc -l < ~/.ssh/authorized_keys) keys"
echo "──────────────────────────────────────────────────────────────"
echo ""
ok "sudo-bootstrap 완료!"
echo ""
echo "다음 단계:"
echo "  1) Windows 측에서 portproxy + Firewall 설정:"
echo "     PowerShell 관리자 권한:"
echo "       New-NetFirewallRule -DisplayName 'WSL SSH 2222' -Direction Inbound -Protocol TCP -LocalPort 2222 -Action Allow"
echo ""
echo "  2) 공유기에 포트포워딩 추가 (외부 SSH 접근 시):"
echo "     외부 2222 → 192.168.31.101:2222"
echo ""
echo "  3) 공동 개발자가 SSH 접근 테스트:"
echo "     ssh -p 2222 $USERNAME@musicalstudio.freedynamicdns.net"
echo ""
echo "  4) Playwright E2E 재실행:"
echo "     cd ~/projects/musical-studio && pnpm test:e2e"
