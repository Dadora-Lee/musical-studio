## 요약

<!-- 1-3 bullet으로 변경 사항 -->

## 관련 task / issue / handoff

<!-- 예: REQ-A-001, T27, docs/agent-handoff/open/2026-05-28-... -->

## 변경 유형

- [ ] feat (새 기능)
- [ ] fix (버그 수정)
- [ ] refactor (리팩토링)
- [ ] docs (문서)
- [ ] test (테스트)
- [ ] chore (빌드/도구)

## Test Plan

- [ ] `pnpm typecheck` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm test` 통과
- [ ] (해당 시) `pnpm test:e2e` 통과
- [ ] (해당 시) 수동 QA: <시나리오 명시>

## Agent 협업 체크

- [ ] `docs/agent-handoff/open/`의 관련 항목 확인 + 처리 (해당 시 `closed/`로 이동)
- [ ] 본 PR이 다른 agent에게 영향 주면 → `docs/agent-handoff/open/`에 새 항목 추가
- [ ] 새 architectural 결정 있으면 → `docs/agent-decisions/`에 commit
- [ ] CONTEXT.md 용어집 변경 필요 시 함께 업데이트

## Co-Authored-By 트레일러 확인

- [ ] 마지막 commit에 `Co-Authored-By: <Agent Name> <agent@email>` 포함

<!--
참조:
- AGENTS.md (SSoT)
- docs/agent-handoff/README.md (협업 프로토콜)
- docs/agents/dev-workflow.md (Local-First 워크플로)
-->
