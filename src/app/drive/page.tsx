import { AppShell } from "@/components/studio/AppShell";
import { WorkspaceSurface } from "@/components/studio/WorkspaceSurface";
import { getCurrentAuthContext } from "@/lib/auth/session";
import { canAccessView } from "@/lib/domain/access-control";

export default async function DrivePage() {
  const authContext = await getCurrentAuthContext();

  return (
    <AppShell active="Google Drive" authContext={authContext}>
      <h1 className="text-3xl font-black">Google Drive</h1>
      <p className="mt-1 text-sm text-slate-600">??? ??? ????????, MR, ??? ??????????? ??????????? ????????.</p>
      <div className="mt-5">
        {canAccessView(authContext, "drive") ? (
          <WorkspaceSurface view="drive" />
        ) : (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">??? ??? ???</p>
        )}
      </div>
    </AppShell>
  );
}
