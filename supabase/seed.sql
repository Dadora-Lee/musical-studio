-- Sample seed data for local testing.
-- 로컬 Supabase에서 db reset 시 자동 실행.
-- 실제 사용자 데이터 아님 — 개발 sandbox 용.

-- Example musical number
insert into public.musical_numbers (id, musical_title, number_title)
values
  ('00000000-0000-0000-0000-000000000001', 'Test Musical', 'Opening Number')
on conflict (id) do nothing;

-- Example roles
insert into public.member_roles (id, number_id, name)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Soprano'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Alto')
on conflict do nothing;

-- Example assignment
insert into public.assignments (id, number_id, week_no)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1)
on conflict do nothing;
