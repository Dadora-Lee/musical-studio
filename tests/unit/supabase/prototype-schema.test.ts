import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('supabase/migrations/20260527000000_initial_schema.sql', 'utf8');
const seed = readFileSync('supabase/seed.sql', 'utf8');

describe('prototype local db schema', () => {
  it('defines the four prototype tables', () => {
    for (const table of ['numbers', 'members', 'works', 'comments']) {
      expect(migration).toContain(`create table public.${table}`);
    }
  });

  it('keeps members lightweight with guest type and castings array', () => {
    expect(migration).toContain("member_type text not null default 'guest'");
    expect(migration).toContain("check (member_type in ('player', 'direction', 'guest'))");
    expect(migration).toContain("castings text[] not null default '{}'");
  });

  it('links works to numbers and members with submitted casting name', () => {
    expect(migration).toContain('number_id integer not null references public.numbers(id)');
    expect(migration).toContain('member_id integer not null references public.members(id)');
    expect(migration).toContain('casting_name text not null');
  });

  it('seeds prototype numbers, members, works, and comments', () => {
    for (const table of ['numbers', 'members', 'works', 'comments']) {
      expect(seed).toContain(`insert into public.${table}`);
    }
    expect(seed).toContain('SONG05_눈물이나');
    expect(seed).toContain('file:///E:/04.Musical/08.팬레터/01.넘버/SONG07_거짓말이아니야/SONG07_MUSIC_SHEET.musicxml.xml');
    expect(seed).toContain('file:///E:/04.Musical/08.팬레터/01.넘버/SONG16_거울/SONG16_MUSIC_SHEET.musicxml.xml');
    expect(seed).toContain("array['히카루']");
    expect(seed).toContain('take_03.wav');
  });
});
