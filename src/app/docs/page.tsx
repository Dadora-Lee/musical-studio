import {
  CURRENT_IMPLEMENTATION_NOTES,
  CURRENT_IMPLEMENTATION_NOTES_KO,
  HANDOFF_REFERENCES,
  HANDOFF_REFERENCES_KO,
  STACK_ITEMS,
  STACK_ITEMS_KO,
} from "@/lib/harness/mock-data";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Musical Studio</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Project Handoff Summary</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            이 페이지는 현재 브랜치 기준 인수인계 요약입니다. 먼저 한국어 버전을 보여주고, 아래에는 외부 협업자를 위한
            English reference를 같은 내용으로 함께 남깁니다.
          </p>
        </div>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="korean-summary-heading">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Korean version</p>
          <h2 id="korean-summary-heading" className="mt-2 text-2xl font-black text-slate-950">한국어 인수인계 요약</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            코드에 익숙하지 않은 사람도 현재 상태를 빠르게 이해할 수 있도록, 실제 구현된 내용과 아직 남은 작업을 한국어로 풀어 쓴 버전입니다.
          </p>
        </section>

        <section className="mt-8" aria-labelledby="current-state-ko-heading">
          <h2 id="current-state-ko-heading" className="text-lg font-black text-slate-950">현재 구현 메모</h2>
          <div className="mt-3 grid gap-2">
            {CURRENT_IMPLEMENTATION_NOTES_KO.map((note) => (
              <div key={note} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm">
                {note}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="stack-ko-heading">
          <h2 id="stack-ko-heading" className="text-lg font-black text-slate-950">구현된 기술 스택과 라우트</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {STACK_ITEMS_KO.map((item) => (
              <article key={item.area} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-black text-slate-950">{item.area}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-700">{item.technology}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.mvpRule}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="handoff-ko-heading">
          <h2 id="handoff-ko-heading" className="text-lg font-black text-slate-950">인수인계 참고 문서</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {HANDOFF_REFERENCES_KO.map((reference) => (
              <article key={reference.path} className="border-b border-slate-200 p-4 last:border-b-0">
                <h3 className="font-black text-slate-950">{reference.label}</h3>
                <code className="mt-2 block break-words rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800">
                  {reference.path}
                </code>
                <p className="mt-2 text-sm leading-6 text-slate-700">{reference.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-8" aria-labelledby="english-reference-heading">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">English reference</p>
          <h2 id="english-reference-heading" className="mt-2 text-2xl font-black text-slate-950">English handoff copy</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Same content kept in English for external collaborators, upstream issues, or later agent handoff prompts.
          </p>
        </section>

        <section className="mt-8" aria-labelledby="current-state-heading">
          <h2 id="current-state-heading" className="text-lg font-black text-slate-950">Current implementation notes</h2>
          <div className="mt-3 grid gap-2">
            {CURRENT_IMPLEMENTATION_NOTES.map((note) => (
              <div key={note} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
                {note}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="stack-heading">
          <h2 id="stack-heading" className="text-lg font-black text-slate-950">Implemented stack and route coverage</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {STACK_ITEMS.map((item) => (
              <article key={item.area} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-black text-slate-950">{item.area}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-700">{item.technology}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.mvpRule}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="handoff-heading">
          <h2 id="handoff-heading" className="text-lg font-black text-slate-950">Handoff references</h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {HANDOFF_REFERENCES.map((reference) => (
              <article key={reference.path} className="border-b border-slate-200 p-4 last:border-b-0">
                <h3 className="font-black text-slate-950">{reference.label}</h3>
                <code className="mt-2 block break-words rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800">
                  {reference.path}
                </code>
                <p className="mt-2 text-sm leading-6 text-slate-700">{reference.note}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}