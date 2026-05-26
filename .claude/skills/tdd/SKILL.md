---
name: tdd
description: Test-driven development with vertical-slice red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development. Especially good for MusicXML parsers, audio engine logic, sync calculation, and any business logic where the spec is clear before code exists.
---

# TDD (Vertical Slice)

## The Rule

> Test 1 → Code 1 → 다음 Test → 다음 Code. **호리즌탈 슬라이스 금지.**

DO NOT write all tests first, then all implementation. That produces crap tests divorced from how the code actually works.

## Loop

1. **RED** — 새 테스트 1개 작성. 의도적으로 실패하게.
2. **GREEN** — **최소 코드**로 통과시킴. 추가 기능 금지.
3. **REFACTOR** — GREEN 유지하면서 정리. (선택)
4. 다음 테스트로.

**Never refactor while RED.** Get to GREEN first.

## Test 작성 원칙

- **공개 인터페이스**를 테스트. 구현 detail 테스트 금지.
- 테스트 1개당 assertion 1-3개. 너무 많으면 분리.
- 이름: `should <expected behavior> when <condition>` 패턴.
- Arrange-Act-Assert 명확히 구분.

## 음악 도메인 TDD 예시

### REQ-A-001: MusicXML 렌더링

RED:
```typescript
// tests/unit/lib/musicxml/parse-roles.test.ts
import { describe, it, expect } from 'vitest';
import { parseRoles } from '@/lib/musicxml/parse-roles';

describe('parseRoles', () => {
  it('returns empty array for empty MusicXML', () => {
    expect(parseRoles('<score-partwise></score-partwise>')).toEqual([]);
  });
});
```

GREEN:
```typescript
// src/lib/musicxml/parse-roles.ts
export function parseRoles(xml: string) {
  return [];
}
```

다음 RED:
```typescript
  it('extracts single part with name "Soprano"', () => {
    const xml = `<score-partwise>
      <part-list>
        <score-part id="P1"><part-name>Soprano</part-name></score-part>
      </part-list>
    </score-partwise>`;
    expect(parseRoles(xml)).toEqual([{ partId: 'P1', name: 'Soprano' }]);
  });
```

GREEN:
```typescript
export function parseRoles(xml: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const parts = doc.querySelectorAll('score-part');
  return Array.from(parts).map(p => ({
    partId: p.getAttribute('id')!,
    name: p.querySelector('part-name')?.textContent ?? '',
  }));
}
```

REFACTOR (선택): helper 함수 추출, etc.

## When NOT to TDD

- Spike/POC (탐색 단계). 끝나면 코드 버리고 TDD로 다시.
- Throwaway 스크립트.
- 외부 라이브러리 wrapper 그 자체.

## Coverage 목표

- 비즈니스 로직: 90%+
- 컴포넌트: 70%+
- 통합: 핵심 happy path
- E2E: 핵심 user journey만

## See Also

- `.claude/skills/diagnose/SKILL.md` — 버그 진단 시
- `docs/testing.md` — 전체 테스트 전략
