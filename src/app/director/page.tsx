import { AppShell } from "@/components/studio/AppShell";
import { WorkspaceSurface } from "@/components/studio/WorkspaceSurface";
import { getCurrentAuthContext } from "@/lib/auth/session";
import { canAccessView } from "@/lib/domain/access-control";

export default async function DirectorPage() {
  const authContext = await getCurrentAuthContext();

  return (
    <AppShell active="Director" authContext={authContext}>
      <h1 className="text-3xl font-black">Director</h1>
      <p className="mt-1 text-sm text-slate-600">
        ???????? ??? ????????????? ?????? ????????
      </p>
      <div className="mt-5">
        {canAccessView(authContext, "director") ? (
          <WorkspaceSurface view="director" />
        ) : (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">??? ??? ???</p>
        )}
      </div>
    </AppShell>
  );
}
