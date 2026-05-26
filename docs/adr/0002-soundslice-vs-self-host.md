# ADR-0002: Soundslice 자체 구현 (OSMD + Tone.js)

- **Status**: Accepted
- **Date**: 2026-05-27
- **Deciders**: Dadora-Lee

## Context

원본 요구사항은 "Soundslice 기반으로 진행, 매 기능마다 Soundslice 방식 참조"였음. 실현 가능성을 조사한 결과:

1. **Soundslice 공식 API/임베드는 유료**: Data API는 Teacher $20/월 또는 Licensing $100+/월 (사용자당 $0.50). MVP 무료 단계에선 사용 불가.
2. **Free 플랜**: 임베드 1개 제한.
3. **MusicXML 업로드 API는 "special permission"**: Soundslice에 별도 신청 필요. 2주 MVP 일정에 불확실성.
4. **AUP (Acceptable Use Policy)가 자동화 명시 금지**:
   > "scrape or download content from Soundslice, or otherwise use Soundslice through any engine, software, tool, agent, device or mechanism (including automated scripts, spiders, robots, crawlers, data mining tools or the like)"
5. **임베드 referrer/allowlist 보호** → 비인가 도메인 차단.

요약: 스크래핑·세션 위장 경로는 **ToS 위반 + 계정 정지 리스크**. 공식 경로는 비용 + 불확실성.

## Decision

**Soundslice를 런타임 의존성으로 사용하지 않음.** OSMD + Tone.js로 자체 구현. Soundslice는 **UX 레퍼런스로만** 참고 (스크린샷/메모 → `docs/references/soundslice/` 정리).

자세한 워크플로: `docs/agents/soundslice-reference-workflow.md`.

## Consequences

### Positive

- ToS/AUP 위반 가능성 0
- 비용 0 (OSMD + Tone.js 모두 BSD/MIT 무료)
- 데이터 주권 100% 우리 통제
- 동적 IP 노출 / referrer allowlist 문제 회피
- Vercel/Supabase 같은 표준 인프라와 조합 자유

### Negative

- Soundslice 수준의 "악보-오디오 동기 + 마디 단위 루프 + 파트 mute/solo" 기능을 직접 구현해야 함
  - MusicXML measure → seconds 매핑 필요
  - MR mp3 동기화 (수동 오프셋 정렬 UI 필요)
  - 반복기호/도돌이표 처리는 MVP에서 제외 권장
- "이미 검증된 플레이어"의 안정성을 못 누림

### Acceptable Tradeoffs

- MVP 핵심 기능(MusicXML 표시 + MR 재생 + 마디 루프 + 템포)은 OSMD + Tone.js 조합으로 2주 안에 가능 (검증된 사례 존재).
- 반복기호 등 고급 음악 표기는 사용자 매뉴얼에서 "펼쳐진 MusicXML 권장"으로 우회.

## Alternatives Considered

### A. Soundslice Free + 임베드 1개

- 장: 가장 빠른 데모 가능
- 단: 1슬라이스만, 도메인 allowlist 등록 필수, 본격 서비스 단계에서 부적합
- **거부 (MVP 데모용으로도 사용 안 함)**

### B. Soundslice Licensing $100+/월

- 장: 무제한 임베드, Data API 사용, 검증된 안정성
- 단: 사용자당 $0.50 → 학습 앱에 비용 부담 큼, 데이터 주권 약함
- **거부 (현재 단계 비용 부담 + 추후 마이그레이션 어려움)**

### C. 자체 구현 (선택됨)

- 장: 무료, 자유, ToS 안전
- 단: 개발 부담
- **수용**

### D. Crawl/Scrape Soundslice (세션 위장 등)

- 장: 기능 무료 활용 가능
- 단: **AUP 명시적 위반**. 계정 정지 + 법적 리스크.
- **명시적 거부**

## References

- [Soundslice Data API documentation](https://www.soundslice.com/help/data-api/)
- [Soundslice Acceptable Use Policy](https://www.soundslice.com/terms/aup/)
- [Soundslice Plans & Pricing](https://www.soundslice.com/plans/)
- [Soundslice Embed Allowlists](https://www.soundslice.com/help/en/embedding/basics/49/allowlists/)
- [OpenSheetMusicDisplay GitHub](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay)
- [MIDI Player + Sheet Music with OSMD + Tone.js (DEV.to 예제)](https://dev.to/linmingren/a-midi-player-that-shows-you-the-sheet-music-and-lets-you-play-along-on-a-virtual-piano-492m)
