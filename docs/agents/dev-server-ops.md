# Dev Server 운영 가이드 (Owner용)

> Owner WSL에서 musical-studio dev server를 안정적으로 운영하는 방법.
> systemd user service 기반 — WSL 진입 후 자동 시작, 충돌 시 자동 재시작.

## 현재 운영 방식

- **systemd user service**: `~/.config/systemd/user/musical-studio-dev.service`
- WSL 진입 시 자동 시작 (linger 활성화)
- 충돌 시 5초 후 자동 재시작
- 로그: `~/projects/musical-studio/.next-dev.log`

## 기본 명령

```bash
# 상태 확인
systemctl --user status musical-studio-dev.service

# 시작/중지/재시작
systemctl --user start musical-studio-dev.service
systemctl --user stop musical-studio-dev.service
systemctl --user restart musical-studio-dev.service

# 자동 시작 ON/OFF
systemctl --user enable musical-studio-dev.service
systemctl --user disable musical-studio-dev.service

# 로그 보기 (실시간)
tail -f ~/projects/musical-studio/.next-dev.log

# 또는 journalctl
journalctl --user -u musical-studio-dev.service -f
```

## .env.local 변경 후

```bash
bash scripts/sync-env.sh                                       # secrets.env → .env.local
systemctl --user restart musical-studio-dev.service            # 재시작으로 새 env 적용
```

Next.js HMR이 src/ 변경은 자동 반영하지만, **`.env.local`은 시작 시점에 1회 로드** → restart 필수.

## Health Check

토큰 불요 (middleware 제외 처리됨):

```bash
# localhost
curl http://localhost:3000/api/health

# LAN
curl http://192.168.31.101:3000/api/health

# 외부 (DDNS) — partner는 이걸로
curl http://musicalstudio.freedynamicdns.net:3000/api/health
```

응답: `{"ok":true,"ts":"...","env":"development","name":"musical-studio"}`

## 페이지 접근 (외부)

토큰 필요 (middleware가 검증):

```
http://musicalstudio.freedynamicdns.net:3000/?token=<DEV_ACCESS_TOKEN>
```

- 처음 1회 token 쿼리로 접속 → 쿠키 저장 → 이후 자동
- token은 `.env.local`의 `DEV_ACCESS_TOKEN` 값 (Partner는 secrets.env scp + sync-env.sh로 동일 값 보유)

## Linger (Windows 재부팅 후 자동)

```bash
loginctl show-user soswolf | grep Linger    # Linger=yes 확인
sudo loginctl enable-linger soswolf         # 안 되어 있으면
```

Linger=yes면 Windows 재부팅 + WSL 진입 안 해도 systemd user service 동작 가능 (단, WSL2 자체는 호스트 명령 시점에 부팅됨 — 100% 무인 동작은 별도 셋업 필요).

## Service 파일 위치

```bash
~/.config/systemd/user/musical-studio-dev.service
```

수정 시:
```bash
systemctl --user daemon-reload
systemctl --user restart musical-studio-dev.service
```

## Troubleshooting

### "Active: inactive (dead)"
```bash
journalctl --user -u musical-studio-dev.service --since "10 minutes ago" | tail -50
```

### Port 3000 conflict
```bash
ss -tlnp | grep :3000          # 어떤 프로세스가 점유 중인지
# kill해서 정리 후 service restart
```

### .env.local 사라짐 → 500 에러
```bash
bash scripts/sync-env.sh       # 재생성
systemctl --user restart musical-studio-dev.service
```

### Partner가 health 응답 못 받음 (외부)
1. `systemctl --user status musical-studio-dev.service` → active 확인
2. `curl http://localhost:3000/api/health` → OK 확인
3. 공인 IP 확인: `curl ifconfig.me/ip` → DDNS와 일치하는지
4. 공유기 포트포워딩 3000 활성화 확인
5. Windows Firewall inbound 3000 활성화 확인
   ```powershell
   Get-NetFirewallRule -DisplayName "*WSL*3000*" -ErrorAction SilentlyContinue
   ```

## 향후 개선 (post-MVP)

- main push 시 GitHub Actions webhook으로 dev server 자동 pull + restart
- PM2 또는 zerotouch deploy 도입
- 별도 staging 환경 (옵션)
