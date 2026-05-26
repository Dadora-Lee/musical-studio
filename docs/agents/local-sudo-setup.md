# 로컬 sudo 필요 작업

AI 에이전트의 자동화 권한 외 사용자가 직접 1회 실행해야 하는 시스템 패키지 설치들. WSL2 안에서 한 번만 실행.

## 1. Playwright system libraries (E2E 테스트 실행에 필요)

```bash
# WSL Ubuntu 안에서
cd ~/projects/musical-studio
sudo pnpm exec playwright install-deps chromium webkit
```

또는 수동:

```bash
sudo apt-get update
sudo apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libdbus-1-3 libxkbcommon0 libatspi2.0-0 libx11-6 \
  libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2t64
```

검증: `pnpm exec playwright test tests/e2e/smoke.spec.ts --project chromium`

## 2. mkcert (모바일 마이크 권한용 HTTPS dev)

```bash
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
mkcert -install
cd ~/projects/musical-studio
mkcert localhost 127.0.0.1 192.168.31.101 musicalstudio.freedynamicdns.net
# → localhost+3.pem, localhost+3-key.pem 생성됨
```

이후 dev server:

```bash
pnpm dev:https
# 또는
pnpm exec next dev --experimental-https \
  --experimental-https-key ./localhost+3-key.pem \
  --experimental-https-cert ./localhost+3.pem
```

**모바일에서 trust**: 모바일에서 `http://<LAN_IP>:8080/rootCA.pem` 같은 식으로 mkcert root CA를 install (자세한 방법 [mkcert mobile docs](https://github.com/FiloSottile/mkcert#mobile-devices)).

## 3. 알려진 한계

- **NAT loopback**: 같은 LAN에서 DDNS hostname (musicalstudio.freedynamicdns.net)으로 접근 시 일부 공유기는 작동 안 함. LAN 안에선 `http://192.168.31.101:3000` 사용. 다른 LAN에선 DDNS 사용.
