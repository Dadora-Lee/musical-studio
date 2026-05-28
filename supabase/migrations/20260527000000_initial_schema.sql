-- Musical Studio local prototype schema.
-- This migration is intentionally small for Supabase Local Stack validation.

create table public.numbers (
  id integer generated always as identity primary key,
  title text not null,
  musicxml_url text,
  ar_url text,
  mr_url text,
  vocal_url text,
  created_at timestamptz not null default now()
);

create table public.members (
  id integer generated always as identity primary key,
  nickname text not null unique,
  member_type text not null default 'guest'
    check (member_type in ('player', 'direction', 'guest')),
  castings text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.works (
  id integer generated always as identity primary key,
  number_id integer not null references public.numbers(id) on delete cascade,
  member_id integer not null references public.members(id) on delete cascade,
  casting_name text not null,
  file_name text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create index works_number_id_idx on public.works(number_id);
create index works_member_id_idx on public.works(member_id);

create table public.comments (
  id integer generated always as identity primary key,
  work_id integer not null references public.works(id) on delete cascade,
  member_id integer not null references public.members(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index comments_work_id_idx on public.comments(work_id);

insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;
