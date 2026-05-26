# 공동 개발자 vs 본인 (Owner) 책임 분리

> AI 에이전트가 새 사용자 환경 셋업을 도울 때 참조. 각 외부 서비스별로 누가 가입/설정해야 하는지 명확히.

## 빠른 답변

| 항목 | Owner (Dadora-Lee) | Collaborator (파트너) |
|---|---|---|
| GitHub 계정 | ✅ 본인 계정 + repo 소유 | ✅ **본인 계정 필요** (PR 위해) |
| GitHub PAT | ✅ 발급 (커밋 위해) | ✅ **본인 PAT 필요** (커밋 위해) |
| Google Cloud Console | ✅ 프로젝트 소유 + OAuth Client 발급 | ❌ **불필요** (사용자만) |
| Google 계정 (앱 로그인) | ✅ 본인 Gmail (Test users 등록) | ✅ **본인 Gmail** (Test users로 사용자가 추가) |
| Supabase 가입 | ✅ 본인 가입 + 프로젝트 생성 + key 발급 | ❌ **불필요** (anon key만 받아 사용) |
| Supabase Dashboard 접근 | ✅ 필수 (스키마/RLS 작업) | 선택 (필요시 owner가 멤버 초대) |
| Vercel | (보류) | (보류) |
| WSL2 + Docker | ✅ 본인 PC 설치 | 시나리오 따라 다름 (아래 참조) |
| DDNS 가입 | ✅ 본인 (dev server hosting) | ❌ **불필요** (host URL만 사용) |
| 공유기 포트포워딩 | ✅ 본인 | ❌ **불필요** |

## 핵심 원칙

**"개발 인프라는 한쪽만 소유, 양쪽 모두 본인 GitHub 계정만 필수"**.

- Supabase/Google/DDNS는 owner가 관리. 공동 개발자는 owner가 제공한 key를 .env.local에 채우기만.
- GitHub은 본인 계정 + 본인 PAT 필요 — 커밋 트레일러로 누가 작업했는지 식별 (CODEOWNERS).

## 시나리오별 공동 개발자 PC 셋업

### 시나리오 A: 공동 개발자가 본인 PC에서 직접 개발
필요한 도구 (자기 PC에 설치):
- Node 20+
- pnpm
- git
- gh CLI
- WSL2 + Docker (Windows) 또는 native Linux/macOS

워크플로:
```bash
# 자기 PC 안에서
git clone https://github.com/Dadora-Lee/musical-studio.git
cd musical-studio
cp .env.example .env.local      # owner가 준 값 채우기
pnpm install
pnpm dev
```

`docs/onboarding.html`의 전체 가이드 참조.

### 시나리오 B: 공동 개발자가 SSH로 owner PC 접속
필요한 도구 (자기 PC에 설치):
- SSH 클라이언트 (Windows OpenSSH, macOS/Linux 기본)
- 본인 GitHub SSH key (github.com/&lt;username&gt;.keys에 등록되어 있어야 함)
- (선택) VSCode Remote SSH extension

워크플로:
```bash
# 자기 PC에서
ssh -p 2222 soswolf@musicalstudio.freedynamicdns.net
# 또는 LAN 안: ssh -p 2222 soswolf@192.168.31.101

# 원격 셸 안에서 작업
cd ~/projects/musical-studio
git pull
pnpm dev
```

`docs/ssh-guide.html` 참조.

## 권한 부여 절차 (Owner → Collaborator)

새 파트너가 합류할 때 owner가 1회 처리:

1. **GitHub repo collaborator 초대**:
   ```bash
   gh api --method PUT /repos/Dadora-Lee/musical-studio/collaborators/<partner-username> -f permission=push
   ```

2. **Google OAuth Test users에 파트너 Gmail 추가**:
   - Google Cloud Console → Audience → Test users → ADD USERS → 파트너 Gmail 입력 → Save

3. **(선택) SSH 접근 허용**:
   - Owner WSL: `ssh-import-id gh:<partner-username>` 실행
   - 파트너의 GitHub 등록 SSH 공개키가 ~/.ssh/authorized_keys에 자동 추가

4. **(선택) Supabase 멤버 초대** (DB 직접 작업 필요 시만):
   - supabase.com/dashboard → Settings → Team → Invite Member → 파트너 email

5. **.env.local 값 전달** (안전한 채널: Bitwarden 1Password 공유, 절대 채팅 X):
   - SUPABASE_URL/anon key/service_role
   - GOOGLE_CLIENT_ID/SECRET
   - DEV_ACCESS_TOKEN

## 자동화

신규 파트너 합류 시 자동 실행 명령:

```bash
# Owner WSL 안에서
PARTNER_USERNAME=<partner-github-username>
gh api --method PUT /repos/Dadora-Lee/musical-studio/collaborators/$PARTNER_USERNAME -f permission=push
ssh-import-id "gh:$PARTNER_USERNAME"
echo "✅ $PARTNER_USERNAME 합류 완료. .env.local 값 전달 + Google Test users 등록 안내."
```

## 자주 묻는 질문

**Q. 공동 개발자도 Supabase 가입해야 하나요?**  
A. 아니요. owner가 만든 프로젝트의 anon key만 받아서 사용하면 됩니다. Director/Admin 작업이 필요하면 owner가 멤버로 초대 가능.

**Q. Google Cloud Console에 공동 개발자 추가?**  
A. 일반 사용으론 불필요. 본인 Gmail이 Test users에 등록되어 있으면 OAuth 로그인 가능.

**Q. 공동 개발자가 자기 PC에서 dev server 띄울 수 있나요?**  
A. 가능. 본인 PC에 .env.local 셋업 후 `pnpm dev`. owner의 Supabase 프로젝트에 붙음.

**Q. 공동 개발자가 본인 dev server를 만들려면?**  
A. 자기 Supabase 프로젝트 + Google OAuth Client를 별도 발급해서 사용. 단, 같은 DB를 공유 안 하니 별도 환경이 됨. MVP 단계엔 owner의 인프라 공유 권장.

## 보안

- Owner는 .env.local과 .env/secrets.env의 값을 **절대 GitHub에 push 금지** (.gitignore로 보호 중).
- service_role_key와 GOOGLE_CLIENT_SECRET은 **서버 사이드 전용**. 클라이언트 코드에 절대 사용 금지.
- 공동 개발자에게 secret 전달은 Bitwarden/1Password 공유 또는 직접 face-to-face. 채팅 평문 절대 금지.
- 파트너 이탈 시: collaborator 제거 + ssh authorized_keys 정리 + (필요시) secret 회전.
