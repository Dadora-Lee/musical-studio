---
name: zoom-out
description: Get a map of a code area before diving in. Use when user says "이 영역 잘 모르겠어", "여기 코드 어떻게 돌아가는지 알려줘", "구조 파악", or before starting a non-trivial change in unfamiliar code. Especially useful when entering a new module like MusicXML parser or Supabase auth.
---

# Zoom Out

> I don't know this area of code well. Go up a layer of abstraction. Give me a map of all the relevant modules and callers, using the project's domain glossary vocabulary.

## 출력 형식

```markdown
# Zoom-out Map: <area>

## 주요 모듈 (CONTEXT.md 용어 사용)

- `src/lib/<area>/main.ts` — 진입점. 역할: ...
- `src/lib/<area>/helper.ts` — ...

## Callers (누가 이 영역을 사용하나)

- `src/app/(member)/work/page.tsx` line 42
- `src/components/score/ScoreViewer.tsx` line 78

## 외부 의존성

- `opensheetmusicdisplay` (npm) — MusicXML 렌더링
- `@supabase/supabase-js` — 클라이언트

## Data Flow

[그림 또는 화살표 시퀀스]

## 알려진 함정

- (목격된 이슈, gotcha, TODO 등)
```

## 사용 시점

- 새 area 진입 시
- 큰 리팩토링 전
- 새 멤버 onboarding 시
- 버그 보고서 받았을 때 (해당 area의 첫 매핑)

## 작성 원칙

- **CONTEXT.md 용어 사용**: 일관성 유지
- **추상화 1 레벨만 위로**: 너무 zoom-out 하면 추상적, 너무 가까이 보면 디테일 폭주
- **callers 누락 금지**: `grep -r 'import.*from.*<area>'` 로 검증
