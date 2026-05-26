---
name: grill-me
description: Interview the user relentlessly about every aspect of a plan until shared understanding. Use when user mentions a new feature, says "이거 어떻게 만들까", proposes a non-trivial change, or before drafting an ADR. Especially important before MVP feature work.
---

# Grill Me

> Interview the user relentlessly about every aspect of this plan until we reach a shared understanding.

## 규칙

- **한 번에 질문 1개만**. 사용자 답 기다리고 다음 질문.
- **"누가/뭘/언제/어떻게/왜"** 4W1H 커버.
- **edge case** 의식적으로 탐색: empty, max size, concurrent, slow network, mobile.
- **음악 도메인 특수성**: 반복기호? 멀티 보컬? 빠른 패시지? leakage?

## 질문 카테고리 (체크리스트)

### Who (사용자)

- Member / Director / Admin 중 누구의 화면?
- 모바일/PC 비율은?
- 신규 user/기존 user의 차이?

### What (기능)

- Happy path 정의 (3-5 step)
- Failure case 정의 (사용자가 실수할 수 있는 모든 방식)
- 단축키/모바일 제스처는?

### When (시점)

- 언제 동작? (always / on-demand / event triggered)
- 다른 기능과의 의존성?

### How (구현 hint, 단 사용자가 모를 수 있으니 부드럽게)

- 데이터 위치 (DB? Storage? Drive?)
- 권한 (RLS 정책)
- 인증/세션 필요 여부

### Why (백그라운드)

- 왜 이 기능? (해결하려는 문제)
- 우선순위?
- 대체 방법 검토했나?

## 끝내는 조건

다음 모두 충족:
- Acceptance criteria 3-5개 적힌 PRD 1장 작성 가능
- ADR 한 줄 결정 가능
- 첫 테스트 케이스 작성 가능
- "10분 후 다시 와도 같은 결론에 도달할 만큼 명확"

## 형식

PRD 결과 출력:

```markdown
# PRD: <feature>

## 사용자
- <Who 정리>

## 문제
- <Why 정리>

## 솔루션
- <What 정리>

## Acceptance Criteria
- [ ] ...
- [ ] ...
- [ ] ...

## Non-goals
- ...

## Open Questions
- ...

## First Test
```typescript
// <첫 테스트 코드>
```

## See Also

- `.claude/skills/tdd/SKILL.md` — PRD 완성 후 다음 단계
- `docs/adr/` — 큰 결정은 ADR로 박제
