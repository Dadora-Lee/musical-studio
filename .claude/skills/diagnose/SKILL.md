---
name: diagnose
description: Bug diagnosis via fast deterministic feedback loop. Use when user reports a bug, mentions "재현 안 됨", "왜 이게 안 돼", "디버깅", "버그 잡아줘", or any unexplained behavior. Especially useful for MusicXML parsing edge cases, audio latency issues, OAuth callback failures, and mobile-specific bugs.
---

# Diagnose

## Phase 1: Build the Feedback Loop

**This is the skill. Everything else is mechanical.** If you have a fast, deterministic, agent-runnable pass/fail signal for the bug, you will find the cause.

## 우선순위 (위→아래)

1. **실패하는 단위 테스트** ← 최선. 가장 빠른 피드백.
2. **실패하는 통합 테스트** (Supabase local + vitest)
3. **재현 스크립트** (Node.js / shell)
4. **curl 요청** (API 버그)
5. **Playwright E2E 1줄 시나리오**
6. **수동 클릭 → 콘솔 출력** ← 최후. 가장 느림.

## Phase 2: Tag Debug Logs

```typescript
console.log(`[DEBUG-a4f2] parseRoles input length: ${xml.length}`);
console.log(`[DEBUG-a4f2] found parts: ${parts.length}`);
```

정리할 때: `grep -r "DEBUG-a4f2" src/` 후 일괄 삭제.

## Phase 3: Bisect

git bisect로 어느 커밋부터 깨졌는지 확인. 단 매 단계에 결정론적 검증이 필요 (Phase 1의 피드백 루프).

```bash
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
# 각 bisect마다 테스트 실행 → good/bad 표시
```

## Phase 4: Narrow

- 입력 범위 절반으로 줄이며 재현 가능 최소 입력 찾기
- 환경 변수 하나씩 토글
- 의존성 버전 다운그레이드 (특히 OSMD, Tone.js 같은 라이브러리)

## 음악 도메인 특수 사례

### MusicXML 파싱 안 됨

1. 입력 파일 valid한지 (XML 파서로 먼저 확인)
2. namespace 선언 있는지 (`xmlns:xlink="..."` 등)
3. compressed `.mxl`인 경우 zip 해제 후 META-INF/container.xml 확인
4. encoding 이슈 (UTF-8 BOM 등)

### 오디오 latency 큼

1. AudioContext baseLatency 확인 (`audioContext.baseLatency`)
2. MediaRecorder 시작 후 onstart까지의 시간 측정
3. WAV encoder write 시간 측정
4. Tone.js 사용 시 `Tone.Transport.position` vs 실제 시간 차이 측정

### OAuth callback 실패

1. Google Cloud Console redirect URI에 정확한 URL 있는지
2. Supabase Auth → URL Configuration에 redirect URL 있는지
3. cookies/localStorage 비우고 재시도 (이전 세션 잔여)
4. 브라우저 콘솔에서 `localStorage.getItem('supabase.auth.token')` 확인

### 모바일 마이크 안 됨

1. HTTPS인지 (HTTP는 getUserMedia 거부)
2. iOS Safari의 경우 사용자 첫 클릭 후 시도하는지
3. Constraints이 너무 빡빡한지 (`echoCancellation: false` 시도)
4. WebKit 버전 (구버전 iOS 가능성)

## Phase 5: Fix + 회귀 테스트

원인 찾으면:
1. **회귀 테스트 먼저 작성** (RED). 버그를 정확히 재현.
2. 수정.
3. 테스트 통과 (GREEN).
4. 다른 테스트도 다 통과하는지 확인.

## When to Ask the User

- 환경 정보 (브라우저/OS 버전, 디바이스)
- 재현 단계 명확화
- 최근 어떤 작업을 했나 (Git log만으론 부족)

## See Also

- `.claude/skills/tdd/SKILL.md`
- `docs/testing.md`
