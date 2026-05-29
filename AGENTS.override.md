# AGENTS.override.md (Codex CLI)

**See `AGENTS.md` for the project SSoT.**

이 파일은 Codex CLI가 AGENTS.md를 읽은 뒤 적용할 **추가/덮어쓰기** 규칙용. 현재는 추가 룰 없음. AGENTS.md가 충분.

## Codex CLI 검색 순서 (참고)

```
<repo>/AGENTS.override.md   ← 이 파일 (있으면 우선)
<repo>/AGENTS.md            ← SSoT
~/.codex/AGENTS.override.md ← 글로벌 오버라이드 (사용자 설정)
~/.codex/AGENTS.md          ← 글로벌
```

## 주의

- `~/.codex/config.toml`의 `project_doc_max_bytes` 기본 32 KiB — AGENTS.md가 이를 넘으면 일부만 로드됨. 현재 AGENTS.md는 ~7KB, 안전.
## User Approval Ground Rules

- 모든 응답과 작업 설명은 한국어로 한다.
- UI 레이아웃, 화면 구조, 기존 UX 위치, 주요 컴포넌트 배치, 또는 사용자에게 보이는 콘텐츠를 변경하기 전에 반드시 변경 전/변경 후를 비교하는 HTML 문서를 먼저 제공한다.
- 변경 전/변경 후 HTML에는 영향을 받는 화면, 유지되는 요소, 삭제/이동/추가되는 요소, 변경 이유, 되돌릴 기준을 포함한다.
- 사용자가 HTML 비교 문서를 확인하고 승인하기 전에는 UI/콘텐츠 변경 코드를 적용하지 않는다.
- 좌측 Number 목록, HeaderLayout, 재생/녹음 transport, 제출/Feedback 영역처럼 이미 합의된 주요 UX 위치는 명시 승인 없이 이동하거나 제거하지 않는다.
- 마감 날짜, 상태 배지, 파일 정보, 안내 문구처럼 추가 콘텐츠가 필요한 경우에도 어떤 컴포넌트에 어떤 내용이 추가되는지 먼저 정리해 HTML로 보여주고 승인받는다.
- 단순 버그 수정이라도 사용자에게 보이는 배치나 문구가 바뀌면 UI 변경으로 간주한다.
