/**
 * Work 페이지 — 배역 연습 화면.
 * 실제 앱 방식: 서버에서 MusicXML을 읽고 client ScoreViewer에서 OSMD로 렌더링한다.
 */
import { PracticeStudioLayout } from '@/components/practice/PracticeStudioLayout';
import { getPrototypeMusicXmlSource } from '@/lib/musicxml/prototype-source.server';
import { practiceStudioPrototype } from '@/lib/practice/prototype-data';

export const dynamic = 'force-dynamic';

export default async function WorkPage() {
  const scoreSources = Object.fromEntries(
    practiceStudioPrototype.numbers.flatMap((number) => {
      const musicXml = getPrototypeMusicXmlSource(number.id);
      return musicXml ? [[number.id, { url: `/api/prototype-assets/${number.id}/musicxml`, label: musicXml.label }]] : [];
    }),
  );

  return (
    <PracticeStudioLayout
      data={practiceStudioPrototype}
      scoreSources={scoreSources}
    />
  );
}
