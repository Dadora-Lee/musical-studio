import { AppShell } from "@/components/studio/AppShell";
import { DirectorSubmissions } from "@/components/studio/DirectorSubmissions";
import { getCurrentAuthContext } from "@/lib/auth/session";
import { canAccessView } from "@/lib/domain/access-control";

export default async function AssignmentsPage() {
  const authContext = await getCurrentAuthContext();

  return (
    <AppShell active="Assignments" authContext={authContext}>
      <h1 className="text-3xl font-black">Assignments</h1>
      <p className="mt-1 text-sm text-slate-600">
        3일 배포에서는 제출 현황과 제출물 코멘트 구조를 먼저 확인합니다.
      </p>
      <div className="mt-5">
        {canAccessView(authContext, "director") ? <DirectorSubmissions /> : <p className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">접근 권한 없음</p>}
      </div>
    </AppShell>
  );
}
