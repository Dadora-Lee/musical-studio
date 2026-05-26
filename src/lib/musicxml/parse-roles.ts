/**
 * MusicXML에서 Part(배역) 정보 추출.
 * REQ-A-002 본인 배역 필터링의 기반.
 *
 * 입력: MusicXML 텍스트 (string)
 * 출력: ScorePart[] — partId + name
 *
 * 자세한 도메인 용어는 CONTEXT.md 참조.
 */
import { ScorePart } from './types';

/**
 * MusicXML 문자열에서 모든 score-part 정보 추출.
 * 빈 입력 또는 invalid XML에는 빈 배열 반환 (예외 던지지 않음).
 */
export function parseRoles(xml: string): ScorePart[] {
  if (!xml || typeof xml !== 'string' || xml.trim() === '') {
    return [];
  }

  let doc: Document;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(xml, 'application/xml');
  } catch {
    return [];
  }

  // parsererror 체크
  if (doc.querySelector('parsererror')) {
    return [];
  }

  const parts = doc.querySelectorAll('score-part');
  const result: ScorePart[] = [];

  parts.forEach((p) => {
    const partId = p.getAttribute('id');
    const name = p.querySelector('part-name')?.textContent ?? '';
    if (partId) {
      result.push({ partId, name: name.trim() });
    }
  });

  return result;
}
