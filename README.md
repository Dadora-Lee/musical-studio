# Musical Studio

> 아마추어 뮤지컬 배우용 넘버 연습 웹앱. MusicXML 악보 보기 + MR 재생 + 목소리 녹음 + 숙제 제출/피드백.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![CI](https://github.com/Dadora-Lee/musical-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/Dadora-Lee/musical-studio/actions)

## 사람용 안내 (브라우저로 열기)

- **셋업 가이드** (Owner 본인): `docs/onboarding.html`
- **Partner 합류 가이드** (Partner 본인): `docs/PARTNER_ONBOARDING.html`
- **개발 워크플로** (Local-First): `docs/dev-workflow.html`
- **SSH 워크플로**: `docs/ssh-guide.html` (원격 dev server 접근)
- **협업 책임 분리**: `docs/collaborator-roles.html` (Owner vs Collaborator)
- **진행 대시보드**: `docs/dev-dashboard.html`
- **테스트 전략**: `docs/testing.md`
- **초기 자료**: `docs/init_docs/` (요구사항 xlsx, 아키텍처 html)

## AI 에이전트용 안내

- **SSoT**: [`AGENTS.md`](AGENTS.md) ← Claude Code, Antigravity, Codex CLI 모두 첫 로드
- **도메인 용어집**: [`CONTEXT.md`](CONTEXT.md)
- **ADR**: [`docs/adr/`](docs/adr/)
- **워크플로**: [`docs/agents/`](docs/agents/)

## 빠른 시작 (요약)

```bash
git clone git@github.com:Dadora-Lee/musical-studio.git
cd musical-studio
pnpm install
cp .env.example .env.local           # 그 후 secrets 채우기
pnpm dev                              # → http://localhost:3000
```

자세한 내용은 [`docs/onboarding.html`](docs/onboarding.html) 참조.

## 라이선스

Apache-2.0. 자세한 내용 [LICENSE](LICENSE).
