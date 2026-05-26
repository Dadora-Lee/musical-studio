# 일정 단축 전략

> D-day **2026-06-09** (4일 이연 베이스라인). 더 당기기 위한 8가지 액션. 각 액션은 기존 일정의 의존성을 깨지 않으면서 시간을 줄임.

## 현재 일정 vs 단축 목표

| 단계 | 원래 (xlsx) | 베이스 (06-09) | 단축 목표 |
|---|---|---|---|
| D0 | 2026-05-23 | (지남) | (지남) |
| D2 Pilot | 2026-05-25 | **생략** | **생략** |
| W1-1 | 05-26~05-27 | 05-28~05-29 | 05-28 1일 (병렬) |
| W1-2 | 05-28~05-29 | 05-30~06-02 | 05-29~05-30 (병렬) |
| W2-1 | 06-01~06-02 | 06-03~06-04 | 06-01~06-02 |
| W2-2 | 06-03~06-04 | 06-05~06-08 | 06-03~06-04 |
| **MVP 릴리즈** | **06-05** | **06-09** | **06-05~06-06 도달 가능** |

## 8가지 액션

### 1. thin pilot 생략 → P0 MVP 직진

xlsx D2(05-25)는 이미 지남. thin pilot 의도는 "초기 검증"이었으나 우리는 이미 인프라 검증 완료. 곧장 P0 항목 작업.

**적용 시작**: 즉시 (이미 적용 중)

### 2. 3개 worktree 병렬화

3개 AI 에이전트가 동시에 다른 모듈 작업:
- worktree A: Claude Code → `src/lib/musicxml/` (REQ-A-001 OSMD 렌더링)
- worktree B: Antigravity → `src/lib/auth/`, Supabase 스키마 (REQ-AUTH-001/002)
- worktree C: Codex CLI → `src/components/` Shadcn 기반 UI 셸 (Dashboard, Work, Submit, Director 라우트 그룹)

각 worktree는 PR draft로 시작 → 사람 review 후 머지. CODEOWNERS로 핵심 영역 양방 review.

**예상 단축**: 시리얼 3일 → 병렬 1.5일 (50% 절감 잠재)

### 3. Vercel Preview는 (현재 보류) → 직접 LAN/DDNS

빌드/배포 시간 0을 목표로. 단, 우리 정책상 Vercel 보류이므로 **WSL2 dev server를 항상 켜두고** push할 때마다 자동 리로드. CI 결과만 GitHub Actions로 확인.

**예상 단축**: 빌드/배포 지연 0초 유지

### 4. Shadcn Block 템플릿 활용

대시보드/로그인/제출폼 같은 UI는 직접 만들지 말고 [Shadcn Blocks](https://ui.shadcn.com/blocks) 가져다 쓰기. 음악 도메인 UI(OSMD 위 컨트롤)만 직접 작성.

**예상 단축**: UI 개발 50% 절감

### 5. P1 항목은 MVP 후로

xlsx Requirements 시트에서 P1 항목은 MVP 범위에서 제외:
- REQ-A-003 다중 배역 보기
- REQ-A-007 연습 녹음 재생 (저장만 되면 OK)
- REQ-B-003 제출 녹음 청취
- REQ-B-004 과제 생성
- REQ-B-005 MR only 모드

MVP에선 P0만. 위 항목은 post-MVP 스프린트.

**예상 단축**: 2-3일

### 6. 안정 라이브러리는 테스트 생략

OSMD, Supabase Client, Next.js 자체는 이미 검증됨. 우리가 작성한 **비즈니스 로직만** 단위 테스트.
- 우리 코드: `src/lib/musicxml/parseRoles.ts` → 테스트 ✓
- 래퍼: `src/lib/supabase/createClient.ts` → 테스트 ✗ (라이브러리가 보장)

**예상 단축**: 0.5일

### 7. RLS MVP 단순화 → post-MVP 강화

MVP는 명시적 deny + role 기반 minimal 정책만:
- `users` SELECT: 본인만
- `recordings` SELECT: 본인 + Director
- `musical_numbers` SELECT: 인증된 사용자 모두
- `assignments` SELECT: 인증된 사용자 모두

전체 RLS 매트릭스 검증은 post-MVP. 단, **Service role key 절대 클라이언트 노출 금지**는 처음부터.

**예상 단축**: 1일

### 8. 모바일 QA = LAN/DDNS로 휴대폰 직접 접속

별도 디바이스 빌드/디버깅 없이 본인 PC dev server를 휴대폰 브라우저로 접속 (mkcert HTTPS 필요 — 마이크 권한).

**예상 단축**: 0.5일 + 회당 30분 절감

## Net 효과

베이스라인 06-09 → **06-05~06-06 도달 가능** (xlsx 원래 일정 회복).

## 매주 단축 진척 보고

매주 월요일 09:00에 본 문서 하단에 다음 양식으로 추가:

```markdown
## 주차 단축 보고

### 2026-06-01 (Week 2 시작)
- 완료: [task IDs]
- 단축 적용: [어떤 action을 적용했나]
- 효과: 예상 X일 → 실제 Y일
- 차주 계획
```

## Reference

- [Vercel — Next.js Preview](https://vercel.com/docs/deployments/preview-deployments) (보류 옵션)
- [Shadcn Blocks](https://ui.shadcn.com/blocks)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
