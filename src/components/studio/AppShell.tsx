import Link from "next/link";
import type { ReactNode } from "react";
import { buildSignedOutAuthContext, getVisibleViews, type AuthContext } from "@/lib/domain/access-control";
import type { DashboardView } from "@/lib/domain/interaction-state";
import { SidebarGoogleAccount } from "./SidebarGoogleAccount";

const navItems = [
  { label: "Dashboard", href: "/", count: 4, view: "dashboard" },
  { label: "Work", href: "/work", count: 2, view: "work" },
  { label: "Assignments", href: "/assignments", count: 1 },
  { label: "Comments", href: "/comments", count: 3 },
  { label: "Google Drive", href: "/drive", view: "drive" },
  { label: "Director", href: "/director", view: "director" },
  { label: "Admin", href: "/admin", view: "admin" },
  { label: "Settings", href: "/docs" },
  { label: "Dev Harness", href: "/dev/harness" }
] satisfies {
  label: string;
  href: string;
  count?: number;
  view?: DashboardView;
}[];

export function AppShell({
  active,
  adminRequestCount = 0,
  authContext = buildSignedOutAuthContext(),
  children
}: {
  active: string;
  adminRequestCount?: number;
  authContext?: AuthContext;
  children: ReactNode;
}) {
  const visibleViews = getVisibleViews(authContext);
  const canFilterByRole = authContext.state === "active";
  const visibleNavItems = navItems
    .filter((item) => !canFilterByRole || !item.view || visibleViews.includes(item.view))
    .map((item) => (item.label === "Admin" ? { ...item, count: adminRequestCount || undefined } : item));

  return (
    <div className="min-h-screen bg-studio-paper md:grid md:grid-cols-[212px_1fr]">
      <aside className="flex flex-col bg-studio-navy p-4 text-white md:min-h-screen">
        <div className="mb-6 px-2 text-xl font-black">Musical Studio</div>
        <nav className="grid gap-1">
          {visibleNavItems.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                active === item.label ? "bg-white/15 font-black text-white" : "text-blue-100"
              }`}
              href={item.href}
            >
              <span>{item.label}</span>
              {item.count ? <span className="rounded-full bg-white/15 px-2 text-xs">{item.count}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <SidebarGoogleAccount authContext={authContext} />
        </div>
      </aside>
      <main className="mx-auto w-full max-w-7xl p-5">{children}</main>
    </div>
  );
}
