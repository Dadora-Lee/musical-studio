/**
 * MusicXML 도메인 타입.
 * 자세한 용어 정의는 CONTEXT.md 참조.
 */

export interface ScorePart {
  /** MusicXML <score-part id="..."> */
  partId: string;
  /** <part-name> 텍스트 */
  name: string;
}

export interface ParsedScore {
  /** 곡의 파트 목록 */
  parts: ScorePart[];
  /** 마디 총 개수 (있으면) */
  measureCount?: number;
}
