import type { AppRole, MemberStatus } from "@/lib/domain/access-control";
import type { RoleName } from "@/lib/domain/mvp-program";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

export type AdminMemberRow = {
  id: string;
  email: string;
  displayName: string | null;
  appRole: AppRole;
  status: MemberStatus;
  createdAt: string;
  roles: RoleName[];
  primaryRole: RoleName | null;
};

export type AdminRequestStatus = "pending" | "approved" | "rejected" | "held";
export type AdminRequestType = "signup" | "role_change" | "drive_access";

export type AdminRequestRow = {
  id: string;
  memberId: string;
  requestType: AdminRequestType;
  status: AdminRequestStatus;
  requestedByEmail: string;
  handledAt: string | null;
  note: string | null;
  createdAt: string;
  member: AdminMemberRow | null;
};

type MemberRow = {
  id: string;
  email: string;
  display_name: string | null;
  app_role: AppRole;
  status: MemberStatus;
  created_at: string;
  member_role_assignments?: { role_name: RoleName; is_primary: boolean }[];
};

type RequestRow = {
  id: string;
  member_id: string;
  request_type: AdminRequestType;
  status: AdminRequestStatus;
  requested_by_email: string;
  handled_at: string | null;
  note: string | null;
  created_at: string;
  members?: MemberRow | MemberRow[] | null;
};

export async function listAdminMembers(): Promise<AdminMemberRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("members")
    .select("id, email, display_name, app_role, status, created_at, member_role_assignments(role_name, is_primary)")
    .order("created_at", { ascending: false })
    .returns<MemberRow[]>();

  return (data ?? []).map((member) => ({
    id: member.id,
    email: member.email,
    displayName: member.display_name,
    appRole: member.app_role,
    status: member.status,
    createdAt: member.created_at,
    roles: (member.member_role_assignments ?? []).map((assignment) => assignment.role_name),
    primaryRole: member.member_role_assignments?.find((assignment) => assignment.is_primary)?.role_name ?? null
  }));
}

export async function listAdminRequests(): Promise<AdminRequestRow[]> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("admin_requests")
    .select("id, member_id, request_type, status, requested_by_email, handled_at, note, created_at, members(id, email, display_name, app_role, status, created_at, member_role_assignments(role_name, is_primary))")
    .order("created_at", { ascending: false })
    .returns<RequestRow[]>();

  if (error) return [];

  return (data ?? []).map((request) => {
    const member = Array.isArray(request.members) ? request.members[0] : request.members;
    return {
      id: request.id,
      memberId: request.member_id,
      requestType: request.request_type,
      status: request.status,
      requestedByEmail: request.requested_by_email,
      handledAt: request.handled_at,
      note: request.note,
      createdAt: request.created_at,
      member: member ? mapMemberRow(member) : null
    };
  });
}

export function countPendingAdminRequests(requests: AdminRequestRow[]) {
  return requests.filter((request) => request.status === "pending").length;
}

export async function countActiveAdmins() {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("app_role", "admin")
    .eq("status", "active");

  return count ?? 0;
}

function mapMemberRow(member: MemberRow): AdminMemberRow {
  return {
    id: member.id,
    email: member.email,
    displayName: member.display_name,
    appRole: member.app_role,
    status: member.status,
    createdAt: member.created_at,
    roles: (member.member_role_assignments ?? []).map((assignment) => assignment.role_name),
    primaryRole: member.member_role_assignments?.find((assignment) => assignment.is_primary)?.role_name ?? null
  };
}
