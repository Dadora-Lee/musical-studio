"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, CircleDashed, Mic, Music2, ShieldCheck } from "lucide-react";
import { FILE_POLICIES } from "@/lib/file-policy";
import { HARNESS_CHECKS, STACK_ITEMS } from "@/lib/harness/mock-data";

type CheckState = "ready" | "pass" | "fail";

const stateIcon = {
  ready: <CircleDashed className="h-4 w-4 text-slate-400" aria-hidden />,
  pass: <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />,
  fail: <CircleAlert className="h-4 w-4 text-rose-600" aria-hidden />
};

export function HarnessClient() {
  const [results, setResults] = useState<Record<string, CheckState>>({});
  const completed = useMemo(() => Object.values(results).filter((state) => state === "pass").length, [results]);

  function simulateCheck(id: string) {
    setResults((current) => ({ ...current, [id]: "pass" }));
  }

  return (
    <main className="min-h-screen bg-studio-paper p-5">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 rounded-lg bg-studio-navy p-5 text-white">
          <p className="text-sm font-bold text-teal-100">Musical Studio Dev Harness</p>
          <h1 className="mt-1 text-3xl font-black">기술스택 연결 점검</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
            실제 구현 전에 Auth, Supabase, Google Drive, 악보, WAV 녹음, 제출 흐름을 분리해서 검증하는 개발자 전용 화면입니다.
          </p>
        </header>

        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <Metric label="Harness checks" value={`${completed}/${HARNESS_CHECKS.length}`} />
          <Metric label="Recording source" value="WAV" />
          <Metric label="External export" value="MP3 later" />
        </section>

        <section className="mb-5 grid gap-3 lg:grid-cols-2">
          <Panel title="Stack Checks" icon={<ShieldCheck className="h-5 w-5" aria-hidden />}>
            <div className="grid gap-2">
              {HARNESS_CHECKS.map((check) => (
                <div key={check.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3">
                  <div className="flex items-start gap-3">
                    {stateIcon[results[check.id] ?? "ready"]}
                    <div>
                      <p className="text-sm font-black">{check.label}</p>
                      <p className="text-xs leading-5 text-slate-600">{check.description}</p>
                    </div>
                  </div>
                  <button
                    className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black"
                    onClick={() => simulateCheck(check.id)}
                    type="button"
                  >
                    Pass
                  </button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Audio Harness" icon={<Mic className="h-5 w-5" aria-hidden />}>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <strong className="text-sm">WAV recording source</strong>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">audio/wav</span>
              </div>
              <div className="mb-3 h-9 rounded-md border border-teal-200 bg-gradient-to-r from-teal-600 via-teal-300 to-slate-100" />
              <div className="h-16 rounded-md border border-teal-200 bg-[repeating-linear-gradient(90deg,#dff5f2_0_8px,#8bd8cc_8px_11px,#dff5f2_11px_20px)]" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-md bg-teal-700 px-3 py-2 text-xs font-black text-white" type="button">
                  Request mic
                </button>
                <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black" type="button">
                  Record WAV
                </button>
                <button className="rounded-md border border-slate-300 px-3 py-2 text-xs font-black" type="button">
                  Upload to Storage
                </button>
              </div>
            </div>
          </Panel>
        </section>

        <section className="mb-5 grid gap-3 lg:grid-cols-2">
          <Panel title="File Policy" icon={<Music2 className="h-5 w-5" aria-hidden />}>
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-2">Type</th>
                    <th className="p-2">Extensions</th>
                    <th className="p-2">MIME</th>
                  </tr>
                </thead>
                <tbody>
                  {FILE_POLICIES.map((policy) => (
                    <tr key={policy.type} className="border-t border-slate-200 bg-white">
                      <td className="p-2 font-bold">{policy.type}</td>
                      <td className="p-2">{policy.extensions.join(", ")}</td>
                      <td className="p-2 text-slate-600">{policy.mimeTypes.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Architecture Stack">
            <div className="grid gap-2">
              {STACK_ITEMS.map((item) => (
                <div key={item.area} className="rounded-md border border-slate-200 bg-white p-3">
                  <p className="text-sm font-black">{item.area}</p>
                  <p className="mt-1 text-xs font-bold text-teal-700">{item.technology}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{item.mvpRule}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50">
      <div className="flex items-center gap-2 border-b border-slate-200 p-3">
        {icon}
        <h2 className="font-black">{title}</h2>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}
