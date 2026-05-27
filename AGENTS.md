# AGENTS.md

> **SSoT (Single Source of Truth)** for all AI coding agents operating in this repo.
> Claude Code, Antigravity (Gemini), Codex CLI — all read this file first.

## Project Overview

**Musical Studio** — 아마추어 뮤지컬 배우용 넘버 연습 웹앱. MusicXML 악보 렌더링 + MR 재생 + WAV 녹음 + 숙제 제출. 2주 MVP, D-day 2026-06-09.

- **Owner**: Dadora-Lee · soswolf7@gmail.com
- **License**: Apache-2.0
- **Public repo**: github.com/Dadora-Lee/musical-studio

## Tech Stack

- Frontend: Next.js 14 (App Router) · TypeScript (strict) · Tailwind · Shadcn UI · Zustand
- Backend: Supabase (Auth Google OAuth + PostgreSQL + Storage)
- Sheet music: OpenSheetMusicDisplay (OSMD) for MusicXML rendering
- Audio: HTMLAudio (MVP) → Tone.js (Phase 2)
- Recording: MediaRecorder API + WAV encoder
- Testing: Vitest + React Testing Library + Playwright
- Deployment: WSL2 self-hosted (Phase A) → Vercel (보류, future)

## Build & Test Commands

```bash
pnpm install          # install deps
pnpm dev              # next dev (port 3000)
pnpm build            # next build
pnpm typecheck        # tsc --noEmit
pnpm lint             # next lint + eslint
pnpm test             # vitest run
pnpm test:watch       # vitest --watch
pnpm test:e2e         # playwright test
pnpm test:e2e:ui      # playwright test --ui
pnpm supabase:start   # local supabase stack
pnpm supabase:reset   # reset local db
```

## Folder Map

```
musical-studio/
├── AGENTS.md                  # ← This file (SSoT)
├── CLAUDE.md                  # Claude Code stub → AGENTS.md
├── GEMINI.md                  # Antigravity stub → AGENTS.md
├── AGENTS.override.md         # Codex CLI override (if needed)
├── CONTEXT.md                 # 음악 도메인 용어집
├── README.md                  # 사용자용 (link → docs/onboarding.html)
├── LICENSE                    # Apache-2.0
├── CODEOWNERS                 # 양 개발자 review 필수 영역
├── .env.example               # 환경변수 placeholder (커밋됨)
├── .gitignore                 # .env/, node_modules 등 보호
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (member)/          # 부원 화면
│   │   ├── (director)/        # 연출가 화면
│   │   ├── (admin)/           # 관리자 화면
│   │   └── api/               # Route Handlers
│   ├── components/            # Shared UI (Shadcn 기반)
│   ├── lib/
│   │   ├── musicxml/          # MusicXML 파서 — 단일 진입점
│   │   ├── audio-engine/      # 재생/녹음
│   │   ├── supabase/          # Supabase 클라이언트
│   │   └── auth/              # Auth 미들웨어
│   └── stores/                # Zustand 스토어
│
├── supabase/
│   ├── migrations/            # SQL 마이그레이션
│   └── seed.sql               # 샘플 데이터
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/              # 샘플 MusicXML, mp3
│
├── docs/
│   ├── adr/                   # Architecture Decision Records (.md, AI용)
│   ├── agents/                # AI 협업 워크플로우 문서 (.md)
│   ├── testing.md             # 테스트 전략 (.md)
│   ├── onboarding.html        # 사람용 셋업 가이드 (.html)
│   └── dev-dashboard.html     # 진행 대시보드 (.html)
│
├── scripts/
│   ├── setup.sh               # WSL/Linux 부트스트랩
│   └── setup.ps1              # Windows 부트스트랩
│
├── .claude/skills/            # Claude Code 전용 스킬
│   ├── tdd/SKILL.md
│   ├── diagnose/SKILL.md
│   ├── zoom-out/SKILL.md
│   └── grill-me/SKILL.md
│
├── .agents/                   # Antigravity 전용 (cross-tool 호환)
│   ├── rules/
│   │   ├── git.md
│   │   └── safety.md
│   └── skills/
│       └── onboard/SKILL.md
│
└── .github/
    ├── workflows/
    │   ├── ci.yml             # PR 단위 lint+typecheck+test
    │   └── e2e.yml            # main push 시 E2E
    └── CODEOWNERS             # 동일
```

## Working Agreements (협업 4원칙 — Karpathy)

1. **Think Before Coding** — Don't assume. Don't hide confusion. Surface tradeoffs. If multiple interpretations exist, present them — don't pick silently.
2. **Simplicity First** — Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No "flexibility" not requested. If you write 200 lines and it could be 50, rewrite it.
3. **Surgical Changes** — Touch only what you must. Don't 'improve' adjacent code, comments, or formatting. Match existing style. If you notice unrelated dead code, mention it — don't delete it. **Every changed line should trace directly to the user's request.**
4. **Goal-Driven Execution** — Define success criteria. Loop until verified. "Add validation" → "Write tests for invalid inputs, then make them pass". "Fix the bug" → "Write a test that reproduces it, then make it pass".

## Branch Naming

```
ai/<agent>/<short-desc>           ex) ai/claude/add-metronome-bpm-slider
feat/<scope>-<desc>               ex) feat/auth-google-login
fix/<issue-id>-<desc>             ex) fix/12-recording-leakage
refactor/<scope>-<desc>
docs/<scope>
test/<scope>
chore/<scope>
```

`main`은 protected. PR 1 approval 필수.

## Commit Conventions (Conventional Commits)

```
<type>(<scope>): <subject>

<body — what & why, not how>

Co-Authored-By: <Agent Name> <agent@email>
```

- `type`: feat / fix / refactor / docs / test / chore / perf
- **에이전트별 Co-Authored-By 트레일러**:
  - Claude Code: `Co-Authored-By: Claude Code <noreply@anthropic.com>`
  - Codex CLI: `Co-Authored-By: Codex CLI <codex@openai.local>`
  - Antigravity: `Co-Authored-By: Antigravity <antigravity@google.local>`

## Safety Rules (Hard Blocks)

- `.env*`, `secrets/`, `*.pem`, `client_secret*.json` 수정 절대 금지 (.gitignore + pre-commit 강제)
- `pnpm-lock.yaml` 직접 편집 금지 → `pnpm install`로만 갱신
- 데이터베이스 마이그레이션 자동 실행 금지 → PR 리뷰 후 사람이 실행
- 1 PR ≤ 500 LOC (분할 요청)
- `git add .` 금지 → 항상 특정 파일명 지정 (시크릿 누출 방지)
- `git push --force`, `git reset --hard` 금지 (사용자 명시 요청 시 외)
- `wsl --unregister` 등 파괴적 명령은 사용자 명시 요청 시만
- Drive-by 리팩토링 금지: 사용자가 요청하지 않은 인접 코드는 건드리지 않음

## Pre-Push Hook (강제)

```bash
pnpm lint && pnpm typecheck && pnpm test
```

이 셋 다 통과 못 하면 push 차단. 우회 금지.

## Multi-Agent Workflow

- **1 task = 1 branch = 1 worktree = 1 agent** (`docs/agents/worktree.md` 참조)
- 다른 에이전트가 최근 24시간 내 수정한 파일을 또 수정할 땐 **PR 본문에 이유 명시**
- 새 의존성 추가 시 **ADR 1줄 이상** (`docs/adr/`)
- 큰 아키텍처 변경은 ADR 우선 작성
- AGENTS.md를 수정할 땐 양쪽 개발자 모두 review

## Anti-Patterns (3개 스킬셋 종합)

- 추측 금지 (Karpathy): 여러 해석 가능하면 침묵으로 고르지 말고 제시
- 추상화 금지 (Karpathy): 단일 사용처에 추상화 만들지 말 것
- Drive-by 리팩토링 금지 (Karpathy)
- 호리즌탈 슬라이스 금지 (Pocock): 테스트 다 쓰고 코드 다 쓰는 게 아니라 vertical
- 언태그 디버그 로그 금지 (Pocock): `[DEBUG-xxxx]` 프리픽스로 일괄 제거 가능하게
- 불완전 실행 금지 (Tan): 90% 솔루션이 더 짧다는 이유로 채택하지 말 것
- 모델 합의로 사용자 결정 뒤집기 금지 (Tan)
- 아첨 금지: "That's an interesting approach", "There are many ways to think about this" 같은 문구 금지

## Domain-Specific Rules

- **MusicXML 파싱**: `src/lib/musicxml/` 단일 진입점만 사용. ad-hoc 파서 금지.
- **Soundslice 임베드 절대 사용 금지** (라이선스 위반 우려): UX 레퍼런스로만. 자세한 내용 `docs/adr/0002-soundslice-vs-self-host.md`.
- **녹음 원본 = WAV** (sync truth). MP3는 다운로드/외부 업로드 전용.
- **사용자 녹음 파일은 Supabase Storage `recordings` 버킷**에만 저장. Google Drive에 쓰기 금지.
- **MusicXML/MR 파일은 절대 git에 커밋 금지** (저작권 + 용량). Google Drive 또는 Supabase Storage 사용.

## When to Ask the User (Don't Just Decide)

- 새 외부 의존성 (npm 패키지) 추가
- DB 스키마 변경 (마이그레이션 추가)
- Auth/RLS 정책 변경
- 새 환경변수 추가
- 외부 API 호출 추가
- public repo의 README 변경
- 라이선스 관련 사안

## Progressive Disclosure (자세한 내용)

### AI 에이전트용 (.md)
- AI 협업 워크플로: `docs/adr/0001-multi-agent-workflow.md`
- Soundslice 정책: `docs/adr/0002-soundslice-vs-self-host.md`
- Git worktree: `docs/agents/worktree.md`
- Soundslice 레퍼런스 워크플로: `docs/agents/soundslice-reference-workflow.md`
- 일정 단축 전략: `docs/agents/schedule-optimization.md`
- 테스트 전략: `docs/testing.md`
- sudo 자동화: `docs/agents/local-sudo-setup.md`
- SSH 워크플로: `docs/agents/ssh-workflow.md`
- **개발 워크플로 (Local-First 결정)**: `docs/agents/dev-workflow.md`
- 협업 책임 분리 (Owner vs Collaborator): `docs/agents/collaborator-roles.md`
- **Partner 합류 자동 셋업** (Partner AI 첫 실행): `docs/agents/partner-bootstrap.md`

### 사람용 (.html, 시각적)
- 사람용 셋업: `docs/onboarding.html`
- SSH 가이드: `docs/ssh-guide.html`
- **개발 워크플로**: `docs/dev-workflow.html`
- 협업 책임 분리: `docs/collaborator-roles.html`
- 진행 대시보드: `docs/dev-dashboard.html`
- **Partner 합류 가이드** (Partner 본인 1회 확인): `docs/PARTNER_ONBOARDING.html`
- 초기 자료: `docs/init_docs/` (xlsx, html)

### Bootstrap 스크립트
- 일반 셋업: `scripts/setup.sh` / `scripts/setup.ps1`
- sudo 1회 자동화: `scripts/sudo-bootstrap.sh` (SSH 서버 + Playwright deps + mkcert + sudoers NOPASSWD)
- **env 동기화**: `scripts/sync-env.sh` (`.env/secrets.env` → `.env.local`)

---

**파트너 에이전트 첫 실행 시**: 위 문서들을 순서대로 모두 읽고 시작하세요. `docs/onboarding.html`은 셋업 명령 시퀀스를 포함합니다.
