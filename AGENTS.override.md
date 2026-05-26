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
