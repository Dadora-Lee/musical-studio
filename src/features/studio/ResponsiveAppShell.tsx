'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { LogIn, Menu, Music2, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Assignments', href: '/assignments' },
  { label: 'Director', href: '/director' },
  { label: 'Admin', href: '/admin' },
];

export function ResponsiveAppShell({
  activeHref,
  children,
}: Readonly<{
  activeHref: string;
  children: ReactNode;
}>) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-studio-paper text-slate-900 md:grid md:grid-cols-[232px_1fr]">
      <aside className="hidden bg-studio-navy p-4 text-white md:flex md:min-h-screen md:flex-col">
        <SidebarContents activeHref={activeHref} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <Link className="inline-flex items-center gap-2 font-black text-studio-navy" href="/">
            <Music2 className="h-5 w-5" aria-hidden />
            Musical Studio
          </Link>
          <button
            aria-label="메뉴 열기"
            className="rounded-md border border-slate-200 p-2 text-slate-700"
            onClick={() => setIsDrawerOpen(true)}
            type="button"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </header>

        {isDrawerOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              aria-label="메뉴 배경 닫기"
              className="absolute inset-0 h-full w-full bg-slate-950/45"
              onClick={() => setIsDrawerOpen(false)}
              type="button"
            />
            <aside
              aria-label="모바일 메뉴"
              className="relative flex h-full w-[min(82vw,300px)] flex-col bg-studio-navy p-4 text-white shadow-xl"
              role="dialog"
            >
              <div className="mb-4 flex items-center justify-between">
                <Link className="inline-flex items-center gap-2 text-lg font-black" href="/" onClick={() => setIsDrawerOpen(false)}>
                  <Music2 className="h-5 w-5" aria-hidden />
                  Musical Studio
                </Link>
                <button
                  aria-label="메뉴 닫기"
                  className="rounded-md border border-white/15 p-2 text-white"
                  onClick={() => setIsDrawerOpen(false)}
                  type="button"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <SidebarContents activeHref={activeHref} onNavigate={() => setIsDrawerOpen(false)} />
            </aside>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-7xl p-4 sm:p-5">{children}</main>
      </div>
    </div>
  );
}

function SidebarContents({
  activeHref,
  onNavigate,
}: Readonly<{
  activeHref: string;
  onNavigate?: () => void;
}>) {
  return (
    <>
      <Link className="mb-6 hidden items-center gap-2 px-2 text-xl font-black md:inline-flex" href="/" onClick={onNavigate}>
        <Music2 className="h-5 w-5" aria-hidden />
        Musical Studio
      </Link>
      <nav className="grid gap-1" aria-label="주요 메뉴">
        {navItems.map((item) => (
          <Link
            className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
              activeHref === item.href ? 'bg-white/15 font-black text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <GoogleAccountPanel />
    </>
  );
}

function GoogleAccountPanel() {
  return (
    <section className="mt-auto rounded-lg bg-white/10 p-3 text-xs text-blue-50">
      <div className="font-black text-white">Google 계정</div>
      <div className="mt-2 grid gap-1">
        <span className="text-blue-100">로그인 계정</span>
        <strong className="truncate text-white">연결 안 됨</strong>
        <span className="rounded bg-white/10 px-2 py-1 font-bold text-blue-100">로그아웃</span>
      </div>
      <Link
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 font-black text-studio-navy"
        href="/auth/login"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Google 로그인
      </Link>
    </section>
  );
}
