# Git Worktree 워크플로 (멀티 에이전트)

> "1 task = 1 branch = 1 worktree = 1 agent" 원칙. 서로 다른 AI가 같은 파일을 동시에 덮어쓰는 사고를 막는 가장 단순한 방법.

## 개념

`git worktree`는 같은 리포지토리를 **여러 디렉토리에 동시 체크아웃**. 각 worktree마다 다른 브랜치 가능. 메인 체크아웃에 영향 없이 독립 작업.

## 표준 명령

### 새 worktree 생성

```bash
cd ~/projects/musical-studio

# 새 브랜치 + 새 worktree
git worktree add -b ai/claude/add-osmd-renderer ../musical-studio-osmd main

# 또는 기존 브랜치 체크아웃
git worktree add ../musical-studio-osmd ai/claude/add-osmd-renderer
```

생긴 디렉토리: `~/projects/musical-studio-osmd/`

### Worktree 목록

```bash
git worktree list
```

### Worktree 제거 (작업 완료 후)

```bash
# 1. 해당 worktree에서 commit/push 끝낸 후
cd ~/projects/musical-studio
git worktree remove ../musical-studio-osmd
git branch -d ai/claude/add-osmd-renderer  # 머지된 브랜치 정리
```

## 네이밍 규칙

- 디렉토리: `musical-studio-<task-id-or-short-desc>` (예: `musical-studio-osmd`, `musical-studio-auth`)
- 브랜치: `ai/<agent>/<short-desc>` (예: `ai/claude/add-osmd-renderer`)
- 1 worktree = 1 PR 단위. PR 머지 후 정리.

## 권장 워크플로 (각 에이전트 세션 시작 시)

```bash
# 0) 프로젝트 진입
cd ~/projects/musical-studio

# 1) main 최신화
git checkout main
git pull --rebase origin main

# 2) 작업 worktree 만들기
WORK_DESC=osmd-renderer
git worktree add -b ai/claude/$WORK_DESC ../musical-studio-$WORK_DESC main

# 3) Draft PR 열기 (다른 에이전트에게 누가 무엇을 하는지 알림)
cd ../musical-studio-$WORK_DESC
git commit --allow-empty -m "wip: starting $WORK_DESC"
git push -u origin ai/claude/$WORK_DESC
gh pr create --draft --title "WIP: $WORK_DESC" --body "Owner: Claude Code"

# 4) 실제 작업
# ... 코딩 ...

# 5) 푸시 (pre-push hook이 lint+typecheck+test 강제)
git push

# 6) 리뷰 준비 완료 시 draft 해제
gh pr ready

# 7) 머지 후 worktree 정리
cd ../musical-studio
git worktree remove ../musical-studio-$WORK_DESC
```

## 다른 에이전트와 충돌 회피

- 동일 파일을 동시에 수정할 가능성이 보이면:
  1. `git log -1 --pretty='%an %ar' <file>` 로 최근 수정자 확인
  2. 24h 내 다른 에이전트가 수정했으면 **draft PR 본문에 변경 사유 명시**
  3. 핸드오프 가능하면 원작자 worktree에서 작업하도록 핸드오프
- 핵심 모듈(`src/lib/musicxml/`, `src/lib/audio-engine/` 등)은 CODEOWNERS로 양방 review 강제.

## 충돌 발생 시

- 자동 머지를 에이전트에게 위임하지 말 것 — **사람이 의도를 결정**
- `git diff main..HEAD <file>` 로 양쪽 변경 의도 확인 후 cherry-pick

## .gitignore 추가 사항 (자동)

```
# 다른 worktree 디렉토리는 추적 안 함
../musical-studio-*/
```

> 위 항목은 같은 부모 디렉토리에 있을 때만 필요. 일반적으로 worktree 자체는 git 내부에서 추적되므로 ignore 불필요.

## Reference

- [Git 공식: git-worktree](https://git-scm.com/docs/git-worktree)
- [MindStudio — Git Worktrees for Parallel AI Agents](https://www.mindstudio.ai/blog/git-worktrees-parallel-ai-coding-agents)
- [appxlab — Multi-Agent Workflow](https://blog.appxlab.io/2026/03/31/multi-agent-ai-coding-workflow-git-worktrees/)
