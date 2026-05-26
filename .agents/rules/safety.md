# .agents/rules/safety.md (Antigravity 호환)

> 파괴적 명령 차단 + 시크릿 보호.

## Hard Blocks (실행 절대 금지)

다음 명령은 사용자가 **명시적으로** 요청한 경우에만 실행:

- `rm -rf /` 또는 `~` 또는 `*` 같은 광범위 삭제
- `DROP DATABASE`, `DROP TABLE`, `TRUNCATE` (production)
- `git push --force`, `git push -f`
- `git reset --hard` (uncommitted 변경 있을 때)
- `git clean -fdx`
- `kubectl delete`, `terraform destroy`
- `wsl --unregister <distro>`
- `pnpm cache clean --force` (전체 npm 캐시)

## Permitted (build artifact만)

다음은 안전:
- `rm -rf node_modules`
- `rm -rf .next`
- `rm -rf dist`
- `rm -rf __pycache__`
- `rm -rf coverage`
- `pnpm store prune`

## 시크릿 보호

- `.env*`, `client_secret*.json`, `*.pem`, `*.key` 파일에 절대 변경 가하지 말 것
- `.gitignore` 변경 시 시크릿 패턴이 보호되는지 확인 (`git check-ignore .env.local`)
- 커밋 직전 마지막 검증: `git diff --staged | grep -iE '(secret|key|password|token)'`
- 콘솔 출력에서 토큰/key 그대로 echo 금지

## 데이터베이스 안전

- production DB에 직접 쿼리 절대 금지
- 마이그레이션: `supabase migration new <name>` 사용. 직접 `psql -c "ALTER TABLE..."` 금지.
- 마이그레이션 실행: 사용자 review 필요. AI가 자동 실행 금지.

## 외부 호출 자제

- 외부 API 자동 호출 금지 (rate limit, 비용)
- 단, 다음은 OK: GitHub API (gh CLI), Supabase API (anon key), npm registry

## 큰 변경 시 사람 게이트

다음은 사용자 명시 승인 받기 전 진행 금지:
- DB 스키마 변경 → ADR + review
- RLS 정책 변경 → ADR + review
- 새 외부 의존성 추가 (npm 패키지) → README 변경 + 사용자 승인
- public repo의 README 변경 → 사용자 승인
- 라이선스 관련 사안

## 사고 시 절차

1. **stop**: 추가 명령 실행 금지
2. **report**: 사용자에게 즉시 보고 (정확한 명령 + stdout/stderr)
3. **assess**: 무엇이 손상됐는지 (`git status`, `wsl --list -v`)
4. **wait**: 사용자 지시 기다림. 자체 복구 시도 금지.
