import { AppShell } from "@/components/studio/AppShell";
import { WorkspaceSurface } from "@/components/studio/WorkspaceSurface";
import { getCurrentAuthContext } from "@/lib/auth/session";
import { canAccessView } from "@/lib/domain/access-control";

export default async function CommentsPage() {
  const authContext = await getCurrentAuthContext();

  return (
    <AppShell active="Comments" authContext={authContext}>
      <h1 className="text-3xl font-black">Comments</h1>
      <p className="mt-1 text-sm text-slate-600">???????? ?????? ???????? ????????????? ????????</p>
      <div className="mt-5">
        {canAccessView(authContext, "director") ? (
          <WorkspaceSurface view="comments" />
        ) : (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">??? ??? ???</p>
        )}
      </div>
    </AppShell>
  );
}
