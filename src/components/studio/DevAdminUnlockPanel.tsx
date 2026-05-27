"use client";

import { LockKeyhole, X } from "lucide-react";
import { useState } from "react";

export function DevAdminUnlockPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Use the temporary password from DEV_ADMIN_PASSWORD.");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function unlock() {
    setStatus("loading");
    setMessage("Checking temporary admin password...");

    const response = await fetch("/auth/dev-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus("error");
      setMessage(body?.message ?? "Temporary admin unlock failed.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <div className="mt-4 border-t border-rose-200 pt-4">
      <button
        className="inline-flex items-center gap-2 rounded-md bg-studio-navy px-3 py-2 text-sm font-black text-white"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <LockKeyhole className="h-4 w-4" aria-hidden />
        Temporary admin unlock
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4 text-slate-900">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="text-lg font-black">Temporary admin unlock</h2>
                <p className="mt-1 text-xs font-bold text-slate-500">Development-only access for early setup.</p>
              </div>
              <button
                aria-label="Close temporary admin unlock"
                className="rounded-md border border-slate-200 p-2"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="grid gap-3 p-4">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Temporary password
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  value={password}
                />
              </label>
              <button
                className="rounded-md bg-studio-navy px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                disabled={status === "loading"}
                onClick={unlock}
                type="button"
              >
                {status === "loading" ? "Unlocking..." : "Unlock admin"}
              </button>
              <p className={`text-xs font-bold ${status === "error" ? "text-rose-700" : "text-slate-500"}`} role="status">
                {message}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
