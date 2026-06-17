import { AppShell } from "@/components/studio/AppShell";
import { WorkspaceSurface } from "@/components/studio/WorkspaceSurface";
import { getCurrentAuthContext } from "@/lib/auth/session";

export default async function WorkPage() {
  const authContext = await getCurrentAuthContext();

  return (
    <AppShell active="Work" authContext={authContext}>
      <h1 className="text-3xl font-black">Work</h1>
      <p className="mt-1 text-sm text-slate-600">
        ??? ?????????????, ???, WAV ???, ??? ????????????? ????????.
      </p>
      <div className="mt-5">
        {authContext.state === "active" ? (
          <WorkspaceSurface availableRoles={authContext.profile?.roleNames} view="work" />
        ) : (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm">Google ?????? ????????</p>
        )}
      </div>
    </AppShell>
  );
}
