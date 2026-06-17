export const HARNESS_CHECKS = [
  {
    id: "google-auth",
    label: "Google Auth",
    description: "Supabase Auth Google Provider, callback URL, allowed email/domain mapping"
  },
  {
    id: "supabase-db",
    label: "Supabase DB",
    description: "users, musical_numbers, assignments, recordings basic read/write"
  },
  {
    id: "supabase-storage",
    label: "Supabase Storage",
    description: "WAV recording upload, signed URL download, cleanup"
  },
  {
    id: "google-drive",
    label: "Google Drive API",
    description: "file id metadata, MIME type, modified time, source file access"
  },
  {
    id: "score-rendering",
    label: "OSMD / PDF fallback",
    description: "MusicXML render, role part visibility, PDF fallback display"
  },
  {
    id: "audio-recording",
    label: "Audio Recording",
    description: "microphone permission, WAV source creation, playback verification"
  },
  {
    id: "submission-flow",
    label: "Homework Submission",
    description: "practice recording to homework submission and director query"
  }
];

export const STACK_ITEMS = [
  {
    area: "Frontend shell",
    technology: "Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, lucide-react",
    mvpRule: "Dashboard, Work, Assignments, Comments, Google Drive, Director, Admin, Docs, and Dev Harness routes are implemented with the restored Musical Studio shell."
  },
  {
    area: "Auth and admin access",
    technology: "Supabase Auth Google OAuth + local dev admin unlock",
    mvpRule: "Google sign-in remains the production path; DEV_ADMIN_PASSWORD enables a temporary dev-admin session for local verification only."
  },
  {
    area: "Data and admin tools",
    technology: "Supabase SSR/client SDK, service-role admin actions, remote Supabase env in local development",
    mvpRule: "Admin catalog/member actions are wired to Supabase helpers; local mock surfaces stay available for UI-first routes."
  },
  {
    area: "Files and Drive",
    technology: "Google Drive metadata model + Supabase Storage target",
    mvpRule: "The Drive page and panel are present; real Drive API and storage upload flows still need end-to-end credential verification."
  },
  {
    area: "Sheet music",
    technology: "OpenSheetMusicDisplay 1.9.0 with PDF fallback policy",
    mvpRule: "MusicXML role parsing is covered by unit tests; full viewer integration remains an MVP hardening task."
  },
  {
    area: "Audio and submissions",
    technology: "HTMLAudioElement, MediaRecorder/WAV policy, Tone.js 15.1.22",
    mvpRule: "Practice/submission UI state is restored; real recording upload and timeline comments remain next implementation work."
  },
  {
    area: "Feedback",
    technology: "Comments route, submission mock data, Supabase comments model planned",
    mvpRule: "Current comments are navigable UI surfaces; waveform comments are not implemented and no waveform visualization dependency is installed."
  }
];

export const STACK_ITEMS_KO = [
  {
    area: "프론트엔드 화면 구조",
    technology: "Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, lucide-react",
    mvpRule: "Dashboard, Work, Assignments, Comments, Google Drive, Director, Admin, Docs, Dev Harness 라우트가 현재 복원된 Musical Studio 셸 안에서 동작합니다."
  },
  {
    area: "로그인과 관리자 접근",
    technology: "Supabase Auth Google OAuth + 로컬 개발용 관리자 잠금 해제",
    mvpRule: "실제 운영 로그인은 Google 로그인을 기준으로 두고, DEV_ADMIN_PASSWORD는 로컬 검증을 위한 임시 dev-admin 세션에만 사용합니다."
  },
  {
    area: "데이터와 관리자 도구",
    technology: "Supabase SSR/client SDK, service-role 관리자 액션, 로컬 개발 환경의 원격 Supabase 설정",
    mvpRule: "Admin의 카탈로그/멤버 액션은 Supabase helper에 연결되어 있고, UI 우선 검증용 mock 화면도 함께 남아 있습니다."
  },
  {
    area: "파일과 Google Drive",
    technology: "Google Drive 메타데이터 모델 + Supabase Storage 저장 대상",
    mvpRule: "Drive 페이지와 패널은 존재하지만, 실제 Drive API와 Storage 업로드 흐름은 credentials 기반 E2E 검증이 아직 필요합니다."
  },
  {
    area: "악보 렌더링",
    technology: "OpenSheetMusicDisplay 1.9.0 + PDF fallback 정책",
    mvpRule: "MusicXML 역할 파싱은 unit test로 보호되어 있고, 실제 viewer 통합은 MVP 안정화 작업으로 남아 있습니다."
  },
  {
    area: "오디오와 제출 흐름",
    technology: "HTMLAudioElement, MediaRecorder/WAV 정책, Tone.js 15.1.22",
    mvpRule: "연습/제출 UI 상태는 복원되어 있고, 실제 녹음 업로드와 타임라인 코멘트는 다음 구현 작업입니다."
  },
  {
    area: "피드백",
    technology: "Comments 라우트, 제출 mock data, Supabase comments 모델 계획",
    mvpRule: "현재 Comments는 이동 가능한 UI 화면으로 준비되어 있고, waveform 기반 코멘트 기능은 아직 구현되지 않았습니다."
  }
];

export const HANDOFF_REFERENCES = [
  {
    label: "Session handoff",
    path: "docs/agent-handoff/open/2026-05-27-session-end-to-next.md",
    note: "Origin/main handoff from the prior infrastructure session. Some next-task notes are now partly superseded by this UI restoration branch."
  },
  {
    label: "Developer dashboard artifact",
    path: "docs/dev-dashboard.html",
    note: "Static dashboard summary for phase status and environment checks."
  },
  {
    label: "Agent coordination",
    path: "docs/agents/agent-coordination.md",
    note: "How collaborating agents should coordinate branches, logs, and handoffs."
  },
  {
    label: "Dev server operations",
    path: "docs/agents/dev-server-ops.md",
    note: "Port/process guidance for running the local Next.js dev server."
  }
];

export const HANDOFF_REFERENCES_KO = [
  {
    label: "세션 인수인계 문서",
    path: "docs/agent-handoff/open/2026-05-27-session-end-to-next.md",
    note: "이전 인프라 세션에서 origin/main에 올라온 인수인계 문서입니다. 다만 현재 UI 복원 브랜치에서 일부 다음 작업 메모는 이미 보완되었습니다."
  },
  {
    label: "개발자 대시보드 산출물",
    path: "docs/dev-dashboard.html",
    note: "단계 상태와 환경 점검 내용을 정리한 정적 대시보드입니다."
  },
  {
    label: "Agent 협업 지침",
    path: "docs/agents/agent-coordination.md",
    note: "여러 agent가 브랜치, 로그, 인수인계를 어떻게 맞춰야 하는지 설명합니다."
  },
  {
    label: "개발 서버 운영 지침",
    path: "docs/agents/dev-server-ops.md",
    note: "로컬 Next.js 개발 서버의 포트와 프로세스 운영 기준을 설명합니다."
  }
];

export const CURRENT_IMPLEMENTATION_NOTES = [
  "Latest origin/main has been merged into codex/studio-ui-checkpoint without conflicts.",
  "The restored UI includes /, /work, /assignments, /comments, /drive, /director, /admin, /docs, and /dev/harness.",
  "/login and /auth/login are signed-out login surfaces; they are not the main authenticated workspace.",
  "The dev admin flow is intentionally local-only and controlled by DEV_ADMIN_PASSWORD.",
  "Supabase is configured through environment variables; secrets must stay out of docs, tests, and git output.",
  "Last branch verification after merging main used pnpm typecheck, pnpm test, pnpm lint, and route smoke checks."
];

export const CURRENT_IMPLEMENTATION_NOTES_KO = [
  "최신 origin/main은 codex/studio-ui-checkpoint 브랜치에 충돌 없이 병합된 상태입니다.",
  "복원된 UI에는 /, /work, /assignments, /comments, /drive, /director, /admin, /docs, /dev/harness 라우트가 포함되어 있습니다.",
  "로그인 화면은 로그인되지 않았을 때 보이는 화면이며, /login과 /auth/login은 메인 작업 화면이 아닙니다.",
  "개발용 관리자 흐름은 로컬 검증 전용이며 DEV_ADMIN_PASSWORD로 제어합니다.",
  "Supabase 설정은 환경변수로 관리하며, secret 값은 문서/테스트/git 출력에 노출하면 안 됩니다.",
  "main 병합 이후 브랜치 검증은 pnpm typecheck, pnpm test, pnpm lint, route smoke check 기준으로 진행했습니다."
];