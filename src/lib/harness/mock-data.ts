export const HARNESS_CHECKS = [
  {
    id: "google-auth",
    label: "Google Auth",
    description: "Supabase Auth Google Provider, callback URL, allowed email/domain mapping"
  },
  {
    id: "supabase-db",
    label: "Supabase DB",
    description: "users, musical_numbers, assignments, recordings 기본 read/write"
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
    area: "Frontend",
    technology: "Next.js 14 App Router, TypeScript, Tailwind CSS, Shadcn UI",
    mvpRule: "Dashboard, Work, Submit, Director 화면을 분리하고 UI는 조밀한 운영 도구 톤으로 구성한다."
  },
  {
    area: "Auth",
    technology: "Supabase Auth + Google OAuth",
    mvpRule: "Google email login을 기본으로 하고 users.role과 allowlist로 권한을 확인한다."
  },
  {
    area: "Files",
    technology: "Google Drive API + Supabase Storage",
    mvpRule: "Drive는 악보/MR 원본 참조, Supabase Storage는 사용자 WAV 녹음 저장소로 사용한다."
  },
  {
    area: "Sheet Music",
    technology: "OpenSheetMusicDisplay + PDF fallback",
    mvpRule: "3일 파일럿은 PDF fallback을 허용하고, 2주 MVP에서 MusicXML 파트 필터를 강화한다."
  },
  {
    area: "Audio",
    technology: "HTMLAudioElement, MediaRecorder, WAV encoder, Tone.js",
    mvpRule: "동기화 기준 원본은 WAV로 저장하고 Tone.Transport 정밀 sync는 Phase C로 넘긴다."
  },
  {
    area: "Feedback",
    technology: "Wavesurfer.js",
    mvpRule: "제출물 하위 comment 구조를 먼저 만들고 타임라인 코멘트는 Phase D에서 구현한다."
  }
];
