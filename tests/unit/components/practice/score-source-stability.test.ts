import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('PracticeStudioLayout score source stability', () => {
  it('memoizes the MusicXML source so ScoreViewer does not rerender in a load loop', () => {
    const source = readFileSync('src/components/practice/PracticeStudioLayout.tsx', 'utf8');

    expect(source).toContain('const scoreViewerSource = useMemo(');
    expect(source).toContain('source={scoreViewerSource ?? \'\'}');
    expect(source).not.toContain('source={{ raw: scoreSource.raw }}');
  });
});
