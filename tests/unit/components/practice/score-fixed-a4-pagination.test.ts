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

    expect(source).toContain('drawTitle: true');
    expect(source).toContain("drawingParameters: 'compacttight'");
    expect(source).toContain('newSystemFromXML: false');
    expect(source).toContain('newPageFromXML: false');
    expect(source).toContain('function applyPracticeEngravingRules');
    expect(source).toContain('osmd.setCustomPageFormat(840, 1188)');
    expect(source).toContain('rules.RenderXMeasuresPerLineAkaSystem = measuresPerSystem');
    expect(source).toContain('rules.NewSystemAtXMLNewSystemAttribute = false');
    expect(source).toContain('rules.NewPageAtXMLNewPageAttribute = false');
    expect(source).toContain('rules.CompactMode = true');
    expect(source).toContain('applyPracticeEngravingRules(osmd, measuresPerSystem)');
    expect(source).toContain("await withTimeout(osmd.load(xml), 20000, 'MusicXML load timed out after 20 seconds.');\n        applyPracticeEngravingRules(osmd, measuresPerSystem);");
  });

  it('marks the rendered score as the B-type uniform practice layout', () => {
    const source = readFileSync('src/components/score/ScoreViewer.tsx', 'utf8');

    expect(source).toContain('PRACTICE_SCORE_SPACING');
    expect(source).toContain('uniform-practice');
    expect(source).toContain('data-score-spacing');
    expect(source).toContain('data-score-measures-per-system');
    expect(source).toContain('data-score-target-measures-per-page');
    expect(source).toContain('measuresPerSystem = 4');
    expect(source).toContain("PRACTICE_TARGET_MEASURES_PER_PAGE = '12-16'");
  });

  it('removes MusicXML authoring line breaks before practice layout rendering', () => {
    const source = readFileSync('src/components/score/ScoreViewer.tsx', 'utf8');

    expect(source).toContain('function normalizePracticeMusicXml');
    expect(source).toContain(".replace(/<print\\b[^>]*\\/>/g, '')");
    expect(source).toContain(".replace(/<print\\b[^>]*>[\\s\\S]*?<\\/print>/g, '')");
    expect(source).toContain('.replace(/\\snew-system="yes"/g, \'\')');
    expect(source).toContain('const xml = normalizePracticeMusicXml(');
  });

  it('restores a title when the source MusicXML has no title metadata', () => {
    const source = readFileSync('src/components/score/ScoreViewer.tsx', 'utf8');
    const layout = readFileSync('src/components/practice/PracticeStudioLayout.tsx', 'utf8');

    expect(source).toContain('function ensureMusicXmlTitle');
    expect(source).toContain('<movement-title>${escapeXmlText(title.trim())}</movement-title>');
    expect(source).toContain('drawTitle: true');
    expect(layout).toContain('title={activeNumber.title}');
  });

  it('keeps the MusicXML viewport clipped inside the center score area', () => {
    const source = readFileSync('src/components/practice/PracticeStudioLayout.tsx', 'utf8');

    expect(source).toContain('h-[calc(100%-42px)] min-h-0 overflow-hidden');
    expect(source).toContain('className="h-full"');
  });

  it('exposes loaded MusicXML and fixed-page measure highlighting for piano playback sync', () => {
    const source = readFileSync('src/components/score/ScoreViewer.tsx', 'utf8');

    expect(source).toContain('onMusicXmlLoaded?: (xml: string) => void');
    expect(source).toContain('onMusicXmlLoaded?.(xml)');
    expect(source).toContain('highlightMeasure?: (measureNumber: number) => void');
    expect(source).toContain('function highlightMeasure(measureNumber: number)');
    expect(source).toContain('styleCursorAsMeasureHighlight');
    expect(source).toContain('goToMeasure?: (measureNumber: number) => void');
    expect(source).toContain('function goToMeasure(measureNumber: number)');
    expect(source).toContain('osmd.cursor.nextMeasure()');
  });
});
