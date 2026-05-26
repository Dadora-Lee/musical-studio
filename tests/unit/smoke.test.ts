/**
 * Smoke test — Vitest 셋업 검증.
 * 이 테스트가 통과하면 vitest config, jsdom env, alias 모두 OK.
 */
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('vitest works', () => {
    expect(1 + 1).toBe(2);
  });

  it('jsdom DOM available', () => {
    const el = document.createElement('div');
    el.textContent = 'hello';
    expect(el.textContent).toBe('hello');
  });

  it('DOMParser available (needed for MusicXML)', () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString('<root><a>1</a></root>', 'application/xml');
    expect(doc.querySelector('a')?.textContent).toBe('1');
  });
});
