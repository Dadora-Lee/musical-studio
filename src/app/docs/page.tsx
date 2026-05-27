import { STACK_ITEMS } from "@/lib/harness/mock-data";

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-black">Project Handoff Summary</h1>
      <p className="mt-2 text-sm text-slate-600">
        전체 인수인계 문서는 <code>docs/project-handoff.md</code>에 있습니다. 이 페이지는 개발 중 빠른 참조용입니다.
      </p>
      <div className="mt-6 grid gap-3">
        {STACK_ITEMS.map((item) => (
          <article key={item.area} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-black">{item.area}</h2>
            <p className="mt-1 text-sm text-slate-600">{item.technology}</p>
            <p className="mt-2 text-sm">{item.mvpRule}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
