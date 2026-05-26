# 테스트 전략 (AI 에이전트용)

> 모든 새 코드는 본 전략을 따른다. 본 문서는 mattpocock `/tdd` 스킬, 음악 도메인 특수 사례, manual QA 체크리스트를 통합.

## 테스트 피라미드

```
                🔺 E2E (Playwright)
               /  \   로그인 → 곡 → 악보 → MR → 녹음 → 제출
              /    \  모바일 viewport 시뮬레이션
             /------\
            /        \  Integration (Vitest + Supabase Local)
           /          \  DB 마이그레이션, Auth flow, Storage upload
          /            \
         /______________\ Unit (Vitest + RTL)
                          비즈니스 로직, 컴포넌트, MusicXML 파서, Tone.js 동기 계산
```

비율 권장: **Unit 70% / Integration 20% / E2E 10%**.

## TDD 워크플로 (vertical slice)

mattpocock의 `/tdd` 스킬 그대로 적용. **호리즌탈 슬라이스 금지**.

✅ 권장:
1. 테스트 1개 작성 (RED)
2. 최소 구현으로 통과 (GREEN)
3. 리팩토링 (REFACTOR — GREEN 유지)
4. 다음 테스트로 진행

❌ 금지: 모든 테스트 먼저 → 모든 구현 → run

## 음악 도메인 특화 테스트

### MusicXML 파싱

테스트 데이터: `tests/fixtures/musicxml/`
- `simple-monophonic.musicxml` — 단성 멜로디
- `multi-part-musical.musicxml` — 멀티 파트 (소프라노/알토/테너/베이스)
- `compressed.mxl` — 압축 형식

테스트 패턴:
```typescript
// tests/unit/lib/musicxml/parse-roles.test.ts
import { describe, it, expect } from 'vitest';
import { parseRoles } from '@/lib/musicxml/parse-roles';
import { readFixture } from 'tests/helpers';

describe('parseRoles', () => {
  it('extracts soprano/alto from multi-part-musical', async () => {
    const xml = await readFixture('musicxml/multi-part-musical.musicxml');
    const roles = parseRoles(xml);
    expect(roles).toEqual([
      { name: 'Soprano', partId: 'P1' },
      { name: 'Alto', partId: 'P2' },
      // ...
    ]);
  });

  it('handles .mxl (compressed) input', async () => {
    const mxl = await readFixture('musicxml/compressed.mxl');
    const roles = parseRoles(mxl);
    expect(roles.length).toBeGreaterThan(0);
  });
});
```

### OSMD 렌더링 visual regression

Playwright `toHaveScreenshot()` 사용:
```typescript
// tests/e2e/score-rendering.spec.ts
import { test, expect } from '@playwright/test';

test('renders multi-part musical score', async ({ page }) => {
  await page.goto('/work?numberId=test-multi-part');
  await page.waitForSelector('svg.osmd-canvas');
  await expect(page).toHaveScreenshot('multi-part.png', { maxDiffPixels: 100 });
});
```

### MediaRecorder mocking

jsdom 환경에서 fake stream:
```typescript
// tests/helpers/media-recorder-mock.ts
export function mockMediaRecorder() {
  const blobChunks: Blob[] = [];
  global.MediaRecorder = class {
    state = 'inactive';
    ondataavailable: ((e: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      this.ondataavailable?.({ data: new Blob(['fake-wav'], { type: 'audio/wav' }) });
      this.onstop?.();
    }
  } as any;
}
```

### Tone.js 동기 정확도

```typescript
// tests/unit/lib/audio-engine/sync.test.ts
import { describe, it, expect } from 'vitest';
import { Transport } from 'tone';
import { measureToSeconds } from '@/lib/audio-engine/sync';

describe('measureToSeconds', () => {
  it('120 BPM 4/4 measure 4 → 8 seconds', () => {
    const result = measureToSeconds({ measure: 4, bpm: 120, timeSignature: [4, 4] });
    expect(result).toBeCloseTo(8.0, 2);
  });
});
```

## Manual QA 체크리스트

각 PR 머지 전 (또는 매 spurt 끝나기 전) 본인 + 파트너가 모바일/PC에서 수행:

### Authentication
- [ ] localhost:3000 접속 → Google 로그인 버튼 표시
- [ ] 로그인 → Member 권한으로 Dashboard 진입
- [ ] 새로고침 → 세션 유지
- [ ] 로그아웃 → 로그인 페이지 redirect
- [ ] **Test users 안 등록된 메일로 로그인 시도 → 거부됨**

### Score Viewing (REQ-A-001)
- [ ] 본인 배역이 있는 Number 선택
- [ ] OSMD 악보 3초 이내 표시
- [ ] 본인 배역 staff만 표시 (기본 필터)
- [ ] 페이지 스크롤/줌 OK

### MR Playback (REQ-A-004)
- [ ] Play 버튼 → 음원 재생
- [ ] Pause → 일시 정지
- [ ] Seek bar 드래그 → 위치 이동
- [ ] 모바일에서 자동 재생 정책 회피 (사용자 첫 클릭 후 재생)

### Recording (REQ-A-005, A-006)
- [ ] Record 버튼 → 마이크 권한 prompt
- [ ] 거부 시 fallback 메시지 표시
- [ ] 허용 시 녹음 중 빨간 표시
- [ ] Stop → Supabase Storage에 WAV 업로드
- [ ] **이어폰 안 끼면 MR leakage 경고 표시**
- [ ] 모바일(iOS Safari)에서 동작

### Homework Submission (REQ-B-001)
- [ ] 본인 녹음 목록 표시
- [ ] 하나 선택 → "숙제 제출" 클릭
- [ ] 제출 후 상태 "Submitted" 표시

### Director Dashboard (REQ-B-002)
- [ ] Director 계정으로 로그인
- [ ] 곡/주차별 제출 현황 표시
- [ ] 미제출자 강조 표시
- [ ] 제출 녹음 클릭 → 재생

### 권한 분기
- [ ] Member 계정으로 Director 화면 접근 시도 → 403
- [ ] Member 계정으로 다른 사용자 녹음 직접 URL 접근 → RLS 차단

### 파일 호환성
- [ ] `.musicxml` 업로드 → 렌더링 OK
- [ ] `.mxl` (압축) 업로드 → 렌더링 OK
- [ ] `.mp3` MR → 재생 OK
- [ ] `.wav` MR → 재생 OK
- [ ] 5MB+ MR → 업로드 진행률 표시

### 보안
- [ ] `.env.local` 파일이 git에서 제외되는지 (`git check-ignore .env.local`)
- [ ] `.env/secrets.env`가 git에서 제외되는지
- [ ] service_role_key가 client bundle에 노출 안 되는지 (`grep -r SERVICE_ROLE .next/`)

## CI (GitHub Actions)

`.github/workflows/ci.yml`:
- PR 트리거: lint + typecheck + unit + integration
- main push: + E2E + visual regression

자세한 내용은 `.github/workflows/` 참조.

## 테스트 실행 명령

```bash
pnpm test                 # Vitest (단위 + 통합)
pnpm test:watch           # Vitest watch
pnpm test:coverage        # coverage
pnpm test:e2e             # Playwright (headless)
pnpm test:e2e:ui          # Playwright UI mode
pnpm test:e2e:headed      # 실제 브라우저 보이게
```

## 디버깅 (mattpocock /diagnose 스킬)

핵심: **빠른 결정론적 피드백 루프** 만들기. 자세한 내용 `.claude/skills/diagnose/SKILL.md`.

## Reference

- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright](https://playwright.dev/)
- [mattpocock /tdd 스킬](../.claude/skills/tdd/SKILL.md)
- [mattpocock /diagnose 스킬](../.claude/skills/diagnose/SKILL.md)
