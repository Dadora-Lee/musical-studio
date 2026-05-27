import { approveMember, blockMember, holdMemberRequest, updateMemberAccess } from "@/app/admin/actions";
import type { AdminMemberRow, AdminRequestRow } from "@/lib/admin/members";
import type { AppRole, MemberStatus } from "@/lib/domain/access-control";
import type { RoleName } from "@/lib/domain/mvp-program";

const appRoles: AppRole[] = ["member", "director", "admin"];
const statuses: MemberStatus[] = ["active", "pending", "blocked"];
const musicalRoles: RoleName[] = ["Hikaru", "Se-hun", "Ensemble"];

export function AdminMembersPanel({ members, requests }: { members: AdminMemberRow[]; requests: AdminRequestRow[] }) {
  const pendingRequests = requests.filter((request) => request.status === "pending");
  const handledRequests = requests.filter((request) => request.status !== "pending").slice(0, 8);
  const pending = members.filter((member) => member.status === "pending");
  const managed = members.filter((member) => member.status !== "pending");

  return (
    <div className="grid gap-5">
      <RequestSummary requests={requests} />
      <AdminSection title="Approval Inbox" description="Review Google signup requests and decide access in one place.">
        <ApprovalInbox requests={pendingRequests} />
      </AdminSection>
      <AdminSection title="Recent Decisions" description="Latest handled requests for a short audit trail.">
        <RequestHistory requests={handledRequests} />
      </AdminSection>
      <AdminSection title="Pending Members" description="Fallback list for pending members, including accounts created before the request inbox migration.">
        <MemberTable members={pending} mode="pending" />
      </AdminSection>
      <AdminSection title="Member Access" description="Edit active or blocked member app roles, account status, and musical role assignments.">
        <MemberTable members={managed} mode="managed" />
      </AdminSection>
    </div>
  );
}

function RequestSummary({ requests }: { requests: AdminRequestRow[] }) {
  const pending = requests.filter((request) => request.status === "pending").length;
  const held = requests.filter((request) => request.status === "held").length;
  const handled = requests.filter((request) => request.status === "approved" || request.status === "rejected").length;

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <SummaryCard label="Pending approvals" value={pending} tone="teal" />
      <SummaryCard label="Held for review" value={held} tone="amber" />
      <SummaryCard label="Handled decisions" value={handled} tone="slate" />
    </section>
  );
}

function SummaryCard({ label, tone, value }: { label: string; tone: "amber" | "slate" | "teal"; value: number }) {
  const toneClass = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    slate: "border-slate-200 bg-white text-slate-900",
    teal: "border-teal-200 bg-teal-50 text-teal-900"
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <div className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}

function AdminSection({ children, description, title }: { children: React.ReactNode; description: string; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-black">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function ApprovalInbox({ requests }: { requests: AdminRequestRow[] }) {
  if (requests.length === 0) {
    return <p className="p-4 text-sm font-bold text-slate-500">No approval requests waiting.</p>;
  }

  return (
    <div className="divide-y divide-slate-200">
      {requests.map((request) => {
        const member = request.member;
        if (!member) {
          return (
            <div className="p-4 text-sm text-rose-700" key={request.id}>
              Request {request.id} has no linked member row.
            </div>
          );
        }

        return (
          <div className="grid gap-4 p-4 lg:grid-cols-[minmax(220px,1fr)_minmax(520px,2fr)_auto]" key={request.id}>
            <div>
              <div className="text-sm font-black">{member.displayName ?? "Google user"}</div>
              <div className="mt-1 break-all text-xs text-slate-600">{request.requestedByEmail}</div>
              <div className="mt-2 inline-flex rounded-full bg-teal-50 px-2 py-1 text-xs font-black text-teal-800">{request.requestType}</div>
              <div className="mt-2 text-xs text-slate-500">{formatDateTime(request.createdAt)}</div>
            </div>

            <div className="grid gap-3 md:grid-cols-[120px_120px_1fr_120px]">
              <label className="grid gap-1 text-xs font-bold text-slate-500">
                App role
                <select className="rounded border border-slate-300 px-2 py-2 text-slate-900" name="appRole" form={`request-form-${request.id}`} defaultValue="member">
                  {appRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-slate-500">
                Status
                <select className="rounded border border-slate-300 px-2 py-2 text-slate-900" name="status" form={`request-form-${request.id}`} defaultValue="active">
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="grid gap-1 text-xs font-bold text-slate-500">
                Musical roles
                <div className="flex flex-wrap gap-2 pt-2">
                  {musicalRoles.map((role) => (
                    <label key={role} className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-slate-800">
                      <input form={`request-form-${request.id}`} name="roles" type="checkbox" value={role} />
                      {role}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="grid gap-1 text-xs font-bold text-slate-500">
                Primary
                <select className="rounded border border-slate-300 px-2 py-2 text-slate-900" name="primaryRole" form={`request-form-${request.id}`} defaultValue="Hikaru">
                  {musicalRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-start gap-2">
              <form action={approveMember} id={`request-form-${request.id}`}>
                <input name="memberId" type="hidden" value={member.id} />
                <input name="requestId" type="hidden" value={request.id} />
                <button className="rounded-md bg-teal-700 px-3 py-2 text-xs font-black text-white" type="submit">
                  Approve
                </button>
              </form>
              <form action={holdMemberRequest}>
                <input name="memberId" type="hidden" value={member.id} />
                <input name="requestId" type="hidden" value={request.id} />
                <button className="rounded-md border border-amber-300 px-3 py-2 text-xs font-black text-amber-800" type="submit">
                  Hold
                </button>
              </form>
              <form action={blockMember}>
                <input name="appRole" type="hidden" value="member" />
                <input name="memberId" type="hidden" value={member.id} />
                <input name="requestId" type="hidden" value={request.id} />
                <button className="rounded-md border border-rose-300 px-3 py-2 text-xs font-black text-rose-700" type="submit">
                  Reject
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RequestHistory({ requests }: { requests: AdminRequestRow[] }) {
  if (requests.length === 0) {
    return <p className="p-4 text-sm font-bold text-slate-500">No handled requests yet.</p>;
  }

  return (
    <table className="w-full min-w-[760px] border-collapse text-left text-xs">
      <thead className="bg-slate-50 text-slate-500">
        <tr>
          <th className="border-b border-slate-200 p-2">Email</th>
          <th className="border-b border-slate-200 p-2">Request</th>
          <th className="border-b border-slate-200 p-2">Status</th>
          <th className="border-b border-slate-200 p-2">Handled</th>
          <th className="border-b border-slate-200 p-2">Note</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr key={request.id}>
            <td className="border-b border-slate-200 p-2 font-bold">{request.requestedByEmail}</td>
            <td className="border-b border-slate-200 p-2">{request.requestType}</td>
            <td className="border-b border-slate-200 p-2">{request.status}</td>
            <td className="border-b border-slate-200 p-2">{request.handledAt ? formatDateTime(request.handledAt) : "-"}</td>
            <td className="border-b border-slate-200 p-2">{request.note ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MemberTable({ members, mode }: { members: AdminMemberRow[]; mode: "pending" | "managed" }) {
  if (members.length === 0) {
    return <p className="p-4 text-sm font-bold text-slate-500">No members to show.</p>;
  }

  return (
    <table className="w-full min-w-[980px] border-collapse text-left text-xs">
      <thead className="bg-slate-50 text-slate-500">
        <tr>
          <th className="border-b border-slate-200 p-2">Email</th>
          <th className="border-b border-slate-200 p-2">Name</th>
          <th className="border-b border-slate-200 p-2">Role</th>
          <th className="border-b border-slate-200 p-2">Status</th>
          <th className="border-b border-slate-200 p-2">Musical Roles</th>
          <th className="border-b border-slate-200 p-2">Primary</th>
          <th className="border-b border-slate-200 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr key={member.id}>
            <td className="border-b border-slate-200 p-2 font-bold">{member.email}</td>
            <td className="border-b border-slate-200 p-2">{member.displayName ?? "-"}</td>
            <td className="border-b border-slate-200 p-2">
              <select className="rounded border border-slate-300 px-2 py-1" name="appRole" form={`member-form-${member.id}`} defaultValue={member.appRole}>
                {appRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </td>
            <td className="border-b border-slate-200 p-2">
              <select className="rounded border border-slate-300 px-2 py-1" name="status" form={`member-form-${member.id}`} defaultValue={mode === "pending" ? "active" : member.status}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </td>
            <td className="border-b border-slate-200 p-2">
              <div className="flex flex-wrap gap-2">
                {musicalRoles.map((role) => (
                  <label key={role} className="inline-flex items-center gap-1 font-bold">
                    <input defaultChecked={member.roles.includes(role)} form={`member-form-${member.id}`} name="roles" type="checkbox" value={role} />
                    {role}
                  </label>
                ))}
              </div>
            </td>
            <td className="border-b border-slate-200 p-2">
              <select className="rounded border border-slate-300 px-2 py-1" name="primaryRole" form={`member-form-${member.id}`} defaultValue={member.primaryRole ?? "Hikaru"}>
                {musicalRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </td>
            <td className="border-b border-slate-200 p-2">
              <form action={mode === "pending" ? approveMember : updateMemberAccess} className="inline-flex gap-2" id={`member-form-${member.id}`}>
                <input name="memberId" type="hidden" value={member.id} />
                <button className="rounded-md bg-teal-700 px-3 py-2 font-black text-white" type="submit">
                  {mode === "pending" ? "Approve" : "Save"}
                </button>
              </form>
              <form action={blockMember} className="ml-2 inline-flex">
                <input name="memberId" type="hidden" value={member.id} />
                <input name="appRole" type="hidden" value={member.appRole} />
                <button className="rounded-md border border-rose-300 px-3 py-2 font-black text-rose-700" type="submit">
                  Block
                </button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}
