/**
 * Work 페이지 — 배역 연습 화면.
 * REQ-A-001/002/004/005/006 통합 데모.
 * 현재는 fixture 데이터로 OSMD 렌더링 검증.
 */
import { ScoreViewer } from '@/components/score/ScoreViewer';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// 임시: 서버에서 fixture 읽어 직접 props로 전달.
// 실제로는 Supabase Storage / Drive API 통해 가져와야 함.
async function getFixtureXml(): Promise<string> {
  const path = resolve(process.cwd(), 'tests/fixtures/musicxml/multi-part-musical.musicxml');
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return '';
  }
}

export default async function WorkPage() {
  const xml = await getFixtureXml();

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Work · 배역 연습</h1>
          <p className="text-sm text-slate-500">REQ-A-001 OSMD 렌더링 데모 (fixture)</p>
        </header>
        {xml ? (
          <ScoreViewer source={{ raw: xml }} className="border rounded-lg p-4 bg-white" />
        ) : (
          <p className="text-rose-600">MusicXML fixture를 찾을 수 없습니다.</p>
        )}
      </div>
    </main>
  );
}
