-- ════════════════════════════════════════════════════════════════
-- Musical Studio · Initial Schema
-- 2026-05-27
--
-- 7개 테이블 + Storage bucket + RLS minimal policy.
-- 상세 도메인 정의: CONTEXT.md, xlsx Data Schema sheet.
-- ════════════════════════════════════════════════════════════════

-- ─── Enums ──────────────────────────────────────────────────────
create type user_role as enum ('Admin', 'Director', 'Member');
create type recording_type as enum ('Practice', 'Homework');
create type rep_status as enum ('Pending', 'Approved', 'Rejected');

-- ─── users (auth.users 연동) ────────────────────────────────────
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        user_role not null default 'Member',
  email       text unique,
  created_at  timestamptz not null default now()
);

-- ─── musical_numbers ────────────────────────────────────────────
create table public.musical_numbers (
  id                  uuid primary key default gen_random_uuid(),
  musical_title       text not null,
  number_title        text not null,
  xml_url             text,
  pdf_url             text,
  mr_url              text,
  xml_mime_type       text,
  pdf_mime_type       text,
  mr_mime_type        text,
  drive_xml_file_id   text,
  drive_pdf_file_id   text,
  drive_mr_file_id    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── member_roles (곡별 배역) ───────────────────────────────────
create table public.member_roles (
  id          uuid primary key default gen_random_uuid(),
  number_id   uuid not null references public.musical_numbers(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (number_id, name)
);

-- ─── assignments ────────────────────────────────────────────────
create table public.assignments (
  id              uuid primary key default gen_random_uuid(),
  number_id       uuid not null references public.musical_numbers(id) on delete cascade,
  week_no         int not null check (week_no > 0),
  is_mr_only_mode boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (number_id, week_no)
);

-- ─── recordings (사용자 녹음) ───────────────────────────────────
create table public.recordings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users(id) on delete cascade,
  role_id            uuid not null references public.member_roles(id) on delete restrict,
  assignment_id      uuid references public.assignments(id) on delete set null,
  file_url           text not null,
  file_ext           text not null,
  mime_type          text not null,
  sync_source_format text not null default 'wav',
  mp3_export_url     text,
  duration_sec       numeric,
  type               recording_type not null default 'Practice',
  is_representative  boolean not null default false,
  created_at         timestamptz not null default now()
);

create index recordings_user_id_idx on public.recordings(user_id);
create index recordings_role_id_idx on public.recordings(role_id);

-- ─── rep_requests (대표본 신청) ─────────────────────────────────
create table public.rep_requests (
  id            uuid primary key default gen_random_uuid(),
  recording_id  uuid not null references public.recordings(id) on delete cascade,
  status        rep_status not null default 'Pending',
  decided_by    uuid references public.users(id),
  decided_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- ─── comments (피드백) ──────────────────────────────────────────
create table public.comments (
  id             uuid primary key default gen_random_uuid(),
  recording_id   uuid not null references public.recordings(id) on delete cascade,
  author_id      uuid not null references public.users(id) on delete cascade,
  timestamp_sec  numeric not null check (timestamp_sec >= 0),
  content        text not null,
  created_at     timestamptz not null default now()
);

create index comments_recording_id_idx on public.comments(recording_id);

-- ═════════════════════════════════════════════════════════════════
-- RLS 정책 (MVP 단순화 — Director/Admin 확장은 post-MVP)
-- ═════════════════════════════════════════════════════════════════

alter table public.users enable row level security;
alter table public.musical_numbers enable row level security;
alter table public.member_roles enable row level security;
alter table public.assignments enable row level security;
alter table public.recordings enable row level security;
alter table public.rep_requests enable row level security;
alter table public.comments enable row level security;

-- Helper function: 현재 사용자의 role 조회
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- ─── users: 본인 read, Admin은 전체 read ─────────────────────────
create policy "users select self" on public.users
  for select using (id = auth.uid() or current_user_role() = 'Admin');

create policy "users insert self" on public.users
  for insert with check (id = auth.uid());

create policy "users update self or admin" on public.users
  for update using (id = auth.uid() or current_user_role() = 'Admin');

-- ─── musical_numbers: 인증된 사용자 모두 read, Admin만 write ────
create policy "numbers select authenticated" on public.musical_numbers
  for select using (auth.uid() is not null);

create policy "numbers admin write" on public.musical_numbers
  for all using (current_user_role() = 'Admin')
  with check (current_user_role() = 'Admin');

-- ─── member_roles: 인증된 사용자 모두 read, Admin만 write ──────
create policy "roles select authenticated" on public.member_roles
  for select using (auth.uid() is not null);

create policy "roles admin write" on public.member_roles
  for all using (current_user_role() = 'Admin')
  with check (current_user_role() = 'Admin');

-- ─── assignments: 인증된 사용자 모두 read, Admin/Director write ─
create policy "assignments select authenticated" on public.assignments
  for select using (auth.uid() is not null);

create policy "assignments admin director write" on public.assignments
  for all using (current_user_role() in ('Admin', 'Director'))
  with check (current_user_role() in ('Admin', 'Director'));

-- ─── recordings: 본인 + Director/Admin ─────────────────────────
create policy "recordings select own or director" on public.recordings
  for select using (user_id = auth.uid() or current_user_role() in ('Director', 'Admin'));

create policy "recordings insert own" on public.recordings
  for insert with check (user_id = auth.uid());

create policy "recordings update own" on public.recordings
  for update using (user_id = auth.uid() or current_user_role() = 'Admin');

create policy "recordings delete own or admin" on public.recordings
  for delete using (user_id = auth.uid() or current_user_role() = 'Admin');

-- ─── rep_requests: 본인 신청 + Director/Admin ──────────────────
create policy "rep_requests select related" on public.rep_requests
  for select using (
    exists (
      select 1 from public.recordings r
      where r.id = recording_id and r.user_id = auth.uid()
    )
    or current_user_role() in ('Director', 'Admin')
  );

create policy "rep_requests insert by recorder" on public.rep_requests
  for insert with check (
    exists (
      select 1 from public.recordings r
      where r.id = recording_id and r.user_id = auth.uid()
    )
  );

create policy "rep_requests update director admin" on public.rep_requests
  for update using (current_user_role() in ('Director', 'Admin'))
  with check (current_user_role() in ('Director', 'Admin'));

-- ─── comments: recording owner + author + Director/Admin ───────
create policy "comments select related" on public.comments
  for select using (
    author_id = auth.uid()
    or exists (
      select 1 from public.recordings r
      where r.id = recording_id and r.user_id = auth.uid()
    )
    or current_user_role() in ('Director', 'Admin')
  );

create policy "comments insert authenticated" on public.comments
  for insert with check (author_id = auth.uid());

-- ═════════════════════════════════════════════════════════════════
-- Triggers: updated_at 자동 갱신
-- ═════════════════════════════════════════════════════════════════
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger musical_numbers_updated_at
  before update on public.musical_numbers
  for each row execute function public.set_updated_at();

-- ═════════════════════════════════════════════════════════════════
-- Storage bucket: recordings (WAV)
-- ═════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

-- Storage policies: 본인만 upload, 본인 + Director/Admin read
create policy "recordings storage upload own" on storage.objects
  for insert with check (
    bucket_id = 'recordings'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "recordings storage select own or director" on storage.objects
  for select using (
    bucket_id = 'recordings'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or current_user_role() in ('Director', 'Admin')
    )
  );

create policy "recordings storage delete own or admin" on storage.objects
  for delete using (
    bucket_id = 'recordings'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or current_user_role() = 'Admin'
    )
  );
