# 개발 워크플로 (Local-First) — AI 에이전트용

> **결론**: 공동 개발자는 **본인 PC에서 로컬 개발**하고, **dev server는 통합 테스트·QA·모바일 검증·데모 용도로만** 사용. SSH 접속은 옵션 (디버깅·페어 프로그래밍).

## ⚠ Owner의 특수 사항 (옵션 C 적용)

Owner의 PC는 1대이므로 **Owner의 본인 PC = dev server hosting PC**가 동일 머신. 따라서:

- Owner의 "본인 PC 로컬 작업 공간" = WSL2 안의 `/home/soswolf/projects/musical-studio` (WSL ext4)
- 같은 디렉토리가 **외부에 노출된 dev server 역할도 겸함** (Next.js dev :3000, SSH :2222)
- 즉 Owner는 "local"과 "dev server"라는 두 논리적 역할을 **하나의 디렉토리로 통합**해서 운영

Partner와의 비대칭은 본질이 아닌 머신 개수 차이 (Partner는 2대처럼 owner PC를 외부 dev server로 보지만, Owner는 1대에 모두 있음). Partner의 워크플로는 변함없이 Local-First.

### Windows 측 `C:\Users\7H9Z1\ClaudeCowork\FanLetter\MusicalStudio` 디렉토리

- **STALE** (초기 staging 용도였음, 현재 git 추적 안 됨)
- Owner는 그 디렉토리를 사용하지 않음. WSL ext4가 단일 진실 공급원.
- 자세한 안내는 같은 디렉토리의 `STALE_README.txt` 참조.
- 정리 옵션: 그대로 두기(참조용) / 삭제(시크릿은 WSL에 동일 사본 있음).

## 왜 Local-First인가

| 시나리오 | Local-First | SSH-only |
|---|---|---|
| 두 명이 동시에 다른 feature | ✅ 충돌 0 (각자 worktree) | ⚠ 같은 dev server 경합 |
| HMR 속도 | ⚡ 즉시 (네트워크 0ms) | 🐢 네트워크 latency |
| AI 에이전트 병렬 실행 | ✅ 3개 worktree 동시 | ⚠ shell 충돌 |
| 본인 PC 꺼져있을 때 | ✅ 영향 없음 | ❌ dev server 중단 |
| 환경 일관성 | ⚠ macOS vs Linux 차이 가능 | ✅ 동일 OS |
| 통합 테스트·데모·모바일 | dev server에 합류 | ✅ 자연스러움 |

**채택 이유**: AI 멀티 에이전트 협업 환경에선 충돌 회피가 가장 중요. 환경 차이는 lockfile + CI로 봉인.

## 표준 워크플로 (양 개발자 공통)

```bash
# 자기 PC에서 작업
cd ~/projects/musical-studio
git checkout main
git pull --rebase origin main

# 작업 worktree
git worktree add -b ai/<agent>/<task> ../musical-studio-<task> main
cd ../musical-studio-<task>

# 작업 + 빠른 iteration
pnpm dev                  # 자기 localhost:3000

# 테스트
pnpm test                 # vitest
pnpm test:e2e             # playwright

# 커밋 + push
git add <files>
git commit -m "..."
git push -u origin ai/<agent>/<task>
gh pr create --draft --title "..."

# 머지 후 cleanup
cd ../musical-studio
git worktree remove ../musical-studio-<task>
```

## dev server 활용 시점

본인 PC에서 자기 작업 끝낸 후 dev server에서:

1. **통합 테스트** — 두 사람 작업이 main에 머지된 후 함께 동작 확인
2. **모바일 QA** — DDNS hostname으로 휴대폰 접속 → 마이크 권한, viewport
3. **데모** — 실제 사용자(배우 3-5명)에게 보여줄 때
4. **장시간 테스트** — 본인 PC 끄고도 계속 돌리고 싶을 때
5. **디버그 페어 프로그래밍** — SSH 접속해서 둘이 같은 터미널 공유

## dev server 접속 방법 (테스트용)

본인+파트너 둘 다 사용:
- **브라우저**: `http://musicalstudio.freedynamicdns.net:3000` (다른 LAN) 또는 `http://192.168.31.101:3000` (같은 LAN)
- **인증**: 미들웨어 `DEV_ACCESS_TOKEN` 필요. URL에 `?token=<DEV_ACCESS_TOKEN>` 추가하면 쿠키 저장.
- **모바일**: 위 URL + token으로 접속. HTTPS 필요시 mkcert로 발급된 인증서 install.

## dev server에 코드 배포 방법

본인이 main에 push하면 dev server가 자동 pull (선택 — 아직 미구현)?

**현재**: 본인이 dev server WSL에 SSH 또는 직접 터미널 열어서 수동:
```bash
ssh -p 2222 soswolf@musicalstudio.freedynamicdns.net
cd ~/projects/musical-studio
git pull origin main
# pnpm install 필요 시
pkill -f "next dev" && pnpm dev --hostname 0.0.0.0 &
```

**TODO (post-MVP)**: GitHub Actions의 webhook으로 main push 시 dev server 자동 deploy. 또는 PM2 / systemd 서비스로 항상 실행.

## SSH 접속 옵션 (보조)

이런 경우만 SSH:
- 페어 프로그래밍 (둘이 같은 터미널)
- dev server 디버깅 (로그 확인, 재시작)
- 모바일에서 보이는 버그 — dev server 콘솔 직접 확인

`docs/ssh-guide.html` (사람용), `docs/agents/ssh-workflow.md` (AI용) 참조.

## 환경변수 동기화

**원칙**: 본인 PC의 `.env/secrets.env`가 마스터. `.env.local`은 자동 생성.

```bash
# 본인 PC에서 .env/secrets.env 수정 후
bash scripts/sync-env.sh   # → .env.local 자동 재생성
pnpm dev                    # 새 env로 재시작
```

**파트너에게**: owner가 `.env/secrets.env` 값을 Bitwarden/1Password로 공유 → 파트너가 자기 `.env/secrets.env`에 저장 → `bash scripts/sync-env.sh`.

## DB 일관성

본인+파트너+dev server **모두 같은 Supabase 클라우드 프로젝트**를 가리킴 (`NEXT_PUBLIC_SUPABASE_URL`이 동일). 즉:

- 한 명이 추가한 데이터를 다른 명이 즉시 봄
- 마이그레이션은 owner만 실행 (`supabase db push`)
- RLS 정책으로 사용자별 권한 분리

**주의**: 파괴적 작업 (DROP TABLE 등)은 PR + 양방 review 후에만.
