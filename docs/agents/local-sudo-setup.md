# 로컬 sudo 자동화 (1회 실행 → 이후 모두 자동화)

## TL;DR — 1줄 명령

```bash
cd ~/projects/musical-studio
bash scripts/sudo-bootstrap.sh
```

sudo 비밀번호 1회 입력 → 이후 모든 sudo 작업 자동화 (NOPASSWD 룰 추가).

## 무엇이 자동 설정되나

1. **sudoers NOPASSWD** — 특정 명령만 비밀번호 없이 실행 가능 (`/etc/sudoers.d/musical-studio-<user>`)
   - `apt-get install/update/autoremove`
   - `service ssh *`, `systemctl ssh*`
   - `/usr/local/bin/mkcert`
   - `ssh-import-id`
2. **openssh-server** 설치 + 키 only 인증 (port 2222)
3. **Playwright deps**: libnspr4, libatk-bridge2.0-0 등 ~18개 패키지
4. **mkcert** + libnss3-tools (HTTPS dev 인증서 발급)
5. **GitHub SSH key import** (`ssh-import-id gh:Dadora-Lee`)
6. **WSL boot 시 SSH 자동 시작** (~/.profile + /etc/wsl.conf)

## 실행 후 다음 단계

스크립트 끝에 안내됨. 요약:

```powershell
# Windows 관리자 PowerShell
New-NetFirewallRule -DisplayName "WSL SSH 2222" `
  -Direction Inbound -Protocol TCP -LocalPort 2222 -Action Allow
```

공유기 admin → 포트포워딩 → 외부 2222 → 192.168.31.101:2222

## 신규 파트너 합류 시 자동 명령

```bash
PARTNER=<partner-github-username>
gh api --method PUT /repos/Dadora-Lee/musical-studio/collaborators/$PARTNER -f permission=push
ssh-import-id "gh:$PARTNER"
```

자세한 SSH 워크플로: `docs/ssh-guide.html`

## 알려진 한계

- **NAT loopback**: 같은 LAN에서 DDNS hostname으로 접근 시 일부 공유기에서 작동 안 함. LAN 안에선 LAN IP 사용.
- **WSL2 systemd**: WSL2 + systemd 환경이 아니면 `sudo service ssh start`로 fallback.

## 보안

sudoers 룰은 **특정 명령**만 NOPASSWD 허용. `sudo bash` 같은 광범위한 권한은 여전히 비밀번호 필요. 자세한 룰은 `/etc/sudoers.d/musical-studio-<user>` 참조.
