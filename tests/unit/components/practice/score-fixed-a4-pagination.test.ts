import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('fixed A4 score pagination', () => {
  it('hides non-current OSMD pages instead of stacking every page vertically', () => {
    const source = readFileSync('src/components/score/ScoreViewer.tsx', 'utf8');

    expect(source).toContain("page.style.display = pageNumber === currentPage ? 'flex' : 'none'");
    expect(source).toContain("page.style.marginBottom = '0'");
    expect(source).toContain('aspect-[210/297]');
    expect(source).toContain('w-[min(100%,440px)]');
    expect(source).toContain('overflow-hidden');
  });

  it('fits the active OSMD SVG inside the fixed A4 frame instead of cropping it', () => {
    const source = readFileSync('src/components/score/ScoreViewer.tsx', 'utf8');

    expect(source).toContain('h-[350%] w-[350%]');
    expect(source).toContain('origin-top-left');
    expect(source).toContain('scale-[0.285714]');
    expect(source).toContain("page.style.height = '100%'");
    expect(source).toContain("svg.style.height = '100%'");
    expect(source).toContain("svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')");
  });

  it('uses practice engraving density for roughly 12 to 16 measures per A4 page', () => {
    const source = readFileSync('src/components/score/ScoreViewer.tsx', 'utf8');

    expect(source).toContain('drawTitle: false');
    expect(source).toContain("drawingParameters: 'compacttight'");
    expect(source).toContain('newSystemFromXML: false');
    expect(source).toContain('newPageFromXML: false');
    expect(source).toContain('function applyPracticeEngravingRules');
    expect(source).toContain('osmd.setCustomPageFormat(840, 1188)');
    expect(source).toContain('rules.RenderXMeasuresPerLineAkaSystem = 4');
    expect(source).toContain('rules.NewSystemAtXMLNewSystemAttribute = false');
    expect(source).toContain('rules.NewPageAtXMLNewPageAttribute = false');
    expect(source).toContain('rules.CompactMode = true');
    expect(source).toContain('applyPracticeEngravingRules(osmd)');
    expect(source).toContain("await withTimeout(osmd.load(xml), 20000, 'MusicXML load timed out after 20 seconds.');\n        applyPracticeEngravingRules(osmd);");
  });

  it('removes MusicXML authoring line breaks before practice layout rendering', () => {
    const source = readFileSync('src/components/score/ScoreViewer.tsx', 'utf8');

    expect(source).toContain('function normalizePracticeMusicXml');
    expect(source).toContain(".replace(/<print\\b[^>]*\\/>/g, '')");
    expect(source).toContain(".replace(/<print\\b[^>]*>[\\s\\S]*?<\\/print>/g, '')");
    expect(source).toContain('.replace(/\\snew-system="yes"/g, \'\')');
    expect(source).toContain('const xml = normalizePracticeMusicXml(');
  });

  it('keeps the MusicXML viewport clipped inside the center score area', () => {
    const source = readFileSync('src/components/practice/PracticeStudioLayout.tsx', 'utf8');

    expect(source).toContain('h-[calc(100%-42px)] min-h-0 overflow-hidden');
    expect(source).toContain('className="h-full"');
  });
});
