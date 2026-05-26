/**
 * Unit tests for src/lib/musicxml/parse-roles.ts
 * REQ-A-002 본인 배역 필터링의 기반 함수.
 *
 * TDD vertical slice 적용 (mattpocock /tdd 스킬 참조).
 */
import { describe, it, expect } from 'vitest';
import { parseRoles } from '@/lib/musicxml/parse-roles';
import { readFixture } from '../../../helpers/fixtures';

describe('parseRoles', () => {
  it('returns empty array for empty string', () => {
    expect(parseRoles('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(parseRoles('   \n\t ')).toEqual([]);
  });

  it('returns empty array for invalid XML', () => {
    expect(parseRoles('<not-musicxml')).toEqual([]);
  });

  it('returns empty array for empty score-partwise', () => {
    expect(parseRoles('<score-partwise></score-partwise>')).toEqual([]);
  });

  it('extracts single Soprano part from simple-monophonic fixture', () => {
    const xml = readFixture('musicxml/simple-monophonic.musicxml');
    const roles = parseRoles(xml);
    expect(roles).toEqual([{ partId: 'P1', name: 'Soprano' }]);
  });

  it('extracts SATB parts from multi-part-musical fixture', () => {
    const xml = readFixture('musicxml/multi-part-musical.musicxml');
    const roles = parseRoles(xml);
    expect(roles).toEqual([
      { partId: 'P1', name: 'Soprano' },
      { partId: 'P2', name: 'Alto' },
      { partId: 'P3', name: 'Tenor' },
      { partId: 'P4', name: 'Bass' },
    ]);
  });

  it('skips score-parts without id attribute', () => {
    const xml = `<score-partwise>
      <part-list>
        <score-part><part-name>No ID</part-name></score-part>
        <score-part id="P1"><part-name>Has ID</part-name></score-part>
      </part-list>
    </score-partwise>`;
    expect(parseRoles(xml)).toEqual([{ partId: 'P1', name: 'Has ID' }]);
  });

  it('handles missing part-name as empty string', () => {
    const xml = `<score-partwise>
      <part-list>
        <score-part id="P1"></score-part>
      </part-list>
    </score-partwise>`;
    expect(parseRoles(xml)).toEqual([{ partId: 'P1', name: '' }]);
  });

  it('trims whitespace from part-name', () => {
    const xml = `<score-partwise>
      <part-list>
        <score-part id="P1"><part-name>  Soprano  </part-name></score-part>
      </part-list>
    </score-partwise>`;
    expect(parseRoles(xml)).toEqual([{ partId: 'P1', name: 'Soprano' }]);
  });
});
