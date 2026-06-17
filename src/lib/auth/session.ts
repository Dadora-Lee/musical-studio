import { buildAuthContext, buildSignedOutAuthContext, type AppRole, type AuthUser, type MemberProfile, type MemberStatus } from "@/lib/domain/access-control";
import type { RoleName } from "@/lib/domain/mvp-program";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEV_ADMIN_COOKIE, buildDevAdminAuthContext, verifyDevAdminToken } from "@/lib/auth/dev-admin";

type MemberRow = {
  id: string;
  auth_user_id: string | null;
  email: string;
  display_name: string | null;
  app_role: AppRole;
  status: MemberStatus;
  member_role_assignments?: {
    role_name: RoleName | null;
    is_primary: boolean;
    musical_roles?: { display_name: string } | { display_name: string }[] | null;
  }[];
};

export async function getCurrentAuthContext() {
  const cookieStore = await cookies();
  if (verifyDevAdminToken(cookieStore.get(DEV_ADMIN_COOKIE)?.value)) {
    return buildDevAdminAuthContext();
  }

  const supabase = await createClient();
  if (!supabase) return buildSignedOutAuthContext();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) return buildSignedOutAuthContext();

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? undefined
  };

  const memberClient = createSupabaseServiceRoleClient() ?? supabase;
  const { data: member, error: roleIdError } = await memberClient
    .from("members")
    .select("id, auth_user_id, email, display_name, app_role, status, member_role_assignments(role_name, is_primary, musical_roles(display_name))")
    .eq("email", user.email.toLowerCase())
    .maybeSingle<MemberRow>();

  if (roleIdError) {
    const { data: legacyMember } = await memberClient
      .from("members")
      .select("id, auth_user_id, email, display_name, app_role, status, member_role_assignments(role_name, is_primary)")
      .eq("email", user.email.toLowerCase())
      .maybeSingle<MemberRow>();

    return buildAuthContext({
      user: authUser,
      member: legacyMember ? toMemberProfile(legacyMember) : null
    });
  }

  return buildAuthContext({
    user: authUser,
    member: member ? toMemberProfile(member) : null
  });
}

function toMemberProfile(row: MemberRow): MemberProfile {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    email: row.email,
    displayName: row.display_name,
    appRole: row.app_role,
    status: row.status,
    roleAssignments: (row.member_role_assignments ?? []).map((assignment) => ({
      roleName: resolveAssignmentRoleName(assignment),
      isPrimary: assignment.is_primary
    }))
  };
}

function resolveAssignmentRoleName(assignment: NonNullable<MemberRow["member_role_assignments"]>[number]): RoleName {
  const role = Array.isArray(assignment.musical_roles) ? assignment.musical_roles[0] : assignment.musical_roles;
  return role?.display_name ?? assignment.role_name ?? "Hikaru";
}
