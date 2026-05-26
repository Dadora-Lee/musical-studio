---
name: onboard
description: Automatically set up the dev environment from a fresh repo clone. Use when user provides this repo URL and asks to set up, says "clone and setup", "온보딩", "셋업", "fresh checkout".
---

# Onboard (Antigravity 버전)

`.claude/skills/onboard/SKILL.md`와 동일한 내용. 아래는 그 사본.

## 사전 조건

- Node 20+
- pnpm
- git
- gh CLI
- (선택) Docker Desktop
- WSL2 권장

## 셋업 시퀀스

```bash
cd ~/projects
git clone https://github.com/Dadora-Lee/musical-studio.git
cd musical-studio
pnpm install
cp .env.example .env.local  # 그 후 사용자가 값 채움
pnpm dev
```

자세한 안내: `docs/onboarding.html`.
