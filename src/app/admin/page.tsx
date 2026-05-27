import { AppShell } from "@/components/studio/AppShell";
import { AdminCatalogPanel } from "@/components/studio/AdminCatalogPanel";
import { AdminMembersPanel } from "@/components/studio/AdminMembersPanel";
import { DevAdminUnlockPanel } from "@/components/studio/DevAdminUnlockPanel";
import { listAdminCatalog } from "@/lib/admin/catalog";
import { countPendingAdminRequests, listAdminMembers, listAdminRequests } from "@/lib/admin/members";
import { getCurrentAuthContext } from "@/lib/auth/session";
import { canAccessView } from "@/lib/domain/access-control";

export default async function AdminPage() {
  const authContext = await getCurrentAuthContext();
  const canViewAdmin = canAccessView(authContext, "admin");
  const members = canViewAdmin ? await listAdminMembers() : [];
  const requests = canViewAdmin ? await listAdminRequests() : [];
  const catalog = canViewAdmin ? await listAdminCatalog() : { productions: [], roles: [], numbers: [] };
  const pendingRequestCount = countPendingAdminRequests(requests);

  return (
    <AppShell active="Admin" authContext={authContext} adminRequestCount={pendingRequestCount}>
      <header className="mb-5">
        <h1 className="text-3xl font-black">Admin</h1>
        <p className="mt-1 text-sm text-slate-600">Member signup requests, role approvals, and access decisions.</p>
      </header>
      {canViewAdmin ? (
        <div className="grid gap-6">
          <AdminCatalogPanel catalog={catalog} />
          <AdminMembersPanel members={members} requests={requests} />
        </div>
      ) : (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900">
          <h2 className="text-xl font-black">Access denied</h2>
          <p className="mt-2 text-sm">Only active admin accounts can review requests and manage member access.</p>
          <DevAdminUnlockPanel />
        </section>
      )}
    </AppShell>
  );
}
