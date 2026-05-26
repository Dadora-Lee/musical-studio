# Soundslice 레퍼런스 워크플로

> Soundslice를 런타임 의존성으로 쓰지 않지만(ADR-0002), UX 패턴은 적극 참고. 이 문서는 **참조하는 방법**을 정의.

## 원칙

1. **Soundslice는 UX/UI 레퍼런스로만 사용** — 런타임 의존성 0
2. **참조 결과는 항상 우리 코드로 재구현** — 임베드/iframe 사용 금지
3. **시각 자료(스크린샷, 영상)는 docs/references/ 에 저장** — 학습/리뷰용
4. **저작권/ToS 준수**: 디자인 영감 OK, UI 픽셀 단위 복제 NO

## 워크플로 (기능 구현 전)

### Step 1 — Soundslice에서 해당 기능 동작 캡처

브라우저로 soundslice.com 들어가서 해당 기능 시연 영상/스크린샷 캡처. 예: "마디 단위 루프 기능"이면:

1. Soundslice의 임의 슬라이스 열기
2. 마디 클릭 → 루프 시작/끝 설정 UX 확인
3. 인터랙션 영상 (3-10초) 또는 스크린샷 3-5장
4. 저장 위치: `docs/references/soundslice/<feature>/`
   - 예: `docs/references/soundslice/measure-loop/`
     - `screenshot-1-select-measure.png`
     - `screenshot-2-loop-active.png`
     - `interaction.gif` (선택)
     - `notes.md` (관찰한 UX 패턴 메모)

### Step 2 — notes.md 작성

```markdown
# Soundslice Measure Loop UX 분석

## 캡처일
2026-05-27

## 관찰

- 마디를 클릭하면 첫 클릭에 "루프 시작점" 설정
- 두 번째 마디 클릭 시 "루프 끝점" 설정 + 자동 루프 활성화
- 루프 활성화 표시: 해당 마디들에 노란 배경 + 상단에 "Looping" 라벨
- 루프 해제: 다시 같은 마디 더블클릭 또는 "Clear loop" 버튼

## 우리 구현 시 적용 포인트

- shift-click으로 끝점 명시 분리 (Soundslice는 순차 클릭이라 살짝 헷갈림)
- 키보드: L 키로 루프 토글 (Soundslice는 키바인딩 없음 — 개선)
- 모바일: 길게 누르기로 루프 시작/끝 선택

## 우리 구현 컴포넌트

- `src/components/score/MeasureLoopControl.tsx`
```

### Step 3 — TDD로 구현

`docs/testing.md` 참조. mattpocock의 `/tdd` 스킬 활용.

### Step 4 — 구현 후 visual regression 캡처

우리 구현의 스크린샷도 같은 폴더에 추가:
- `our-impl-1.png`
- `our-impl-2.png`

차이점은 `notes.md`의 "우리 구현 시 적용 포인트" 섹션에서 의도된 차이로 정당화.

## 저장소 구조

```
docs/references/soundslice/
├── measure-loop/
│   ├── notes.md
│   ├── screenshot-1-select-measure.png
│   ├── screenshot-2-loop-active.png
│   └── our-impl-1.png
├── tempo-slider/
│   ├── notes.md
│   └── ...
├── part-mute-solo/
│   └── ...
└── playback-controls/
    └── ...
```

## 절대 하지 말 것 (ToS 위반)

- ❌ Soundslice 임베드(iframe) 사용
- ❌ Soundslice API 호출 (Free에서 불가, 유료라도 자동화는 ToS 위반)
- ❌ Soundslice 슬라이스 URL을 우리 앱에서 사용자에게 노출
- ❌ Soundslice의 audio/MR/MusicXML 파일을 다운로드 자동화
- ❌ Soundslice 세션 쿠키를 .env에 저장하여 헤드리스 크롤링

## Reference

- [ADR-0002 — Soundslice 자체 구현 결정](../adr/0002-soundslice-vs-self-host.md)
- [Soundslice AUP](https://www.soundslice.com/terms/aup/)
