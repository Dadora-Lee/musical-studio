"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAuthContext } from "@/lib/auth/session";
import { requireAppRole } from "@/lib/auth/guards";
import { canChangeTargetMember, type AppRole, type MemberStatus } from "@/lib/domain/access-control";
import type { RoleName } from "@/lib/domain/mvp-program";
import { countActiveAdmins } from "@/lib/admin/members";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

const roleNames: RoleName[] = ["Hikaru", "Se-hun", "Ensemble"];

export async function approveMember(formData: FormData) {
  await saveMemberAccess(formData, "active");
}

export async function updateMemberAccess(formData: FormData) {
  await saveMemberAccess(formData);
}

export async function blockMember(formData: FormData) {
  formData.set("status", "blocked");
  await saveMemberAccess(formData, "blocked");
}

export async function holdMemberRequest(formData: FormData) {
  const context = await getCurrentAuthContext();
  const admin = requireAppRole(context, ["admin"]);
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin mutations.");

  const memberId = String(formData.get("memberId") ?? "");
  const requestId = String(formData.get("requestId") ?? "");
  if (!memberId) throw new Error("memberId is required.");

  await markSignupRequests(supabase, {
    adminMemberId: admin.id ?? null,
    memberId,
    requestId,
    status: "held",
    note: "Admin held this signup request for later review."
  });

  revalidatePath("/admin");
}

async function saveMemberAccess(formData: FormData, forcedStatus?: MemberStatus) {
  const context = await getCurrentAuthContext();
  const admin = requireAppRole(context, ["admin"]);
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin mutations.");

  const memberId = String(formData.get("memberId") ?? "");
  const requestId = String(formData.get("requestId") ?? "");
  const appRole = String(formData.get("appRole") ?? "member") as AppRole;
  const status = forcedStatus ?? (String(formData.get("status") ?? "active") as MemberStatus);
  const selectedRoles = formData.getAll("roles").map(String).filter((role): role is RoleName => roleNames.includes(role as RoleName));
  const primaryRole = String(formData.get("primaryRole") ?? selectedRoles[0] ?? "") as RoleName;
  const activeAdminCount = await countActiveAdmins();

  if (!memberId) throw new Error("memberId is required.");
  if (!canChangeTargetMember({ activeAdminCount, currentAdminMemberId: admin.id ?? "", nextAppRole: appRole, nextStatus: status, targetMemberId: memberId })) {
    throw new Error("Cannot remove or block the last active admin.");
  }

  await supabase.from("members").update({ app_role: appRole, status }).eq("id", memberId);
  await supabase.from("member_role_assignments").delete().eq("member_id", memberId);

  if (status === "active" && selectedRoles.length > 0) {
    const { data: catalogRoles } = await supabase
      .from("musical_roles")
      .select("id, display_name")
      .in("display_name", selectedRoles)
      .returns<{ id: string; display_name: string }[]>();

    await supabase.from("member_role_assignments").insert(
      selectedRoles.map((role) => ({
        member_id: memberId,
        role_id: catalogRoles?.find((catalogRole) => catalogRole.display_name === role)?.id ?? null,
        role_name: role,
        is_primary: role === primaryRole
      }))
    );
  }

  if (forcedStatus === "active" || status === "active") {
    await markSignupRequests(supabase, {
      adminMemberId: admin.id ?? null,
      memberId,
      requestId,
      status: "approved",
      note: "Admin approved this signup request."
    });
  } else if (forcedStatus === "blocked" || status === "blocked") {
    await markSignupRequests(supabase, {
      adminMemberId: admin.id ?? null,
      memberId,
      requestId,
      status: "rejected",
      note: "Admin blocked this member request."
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

async function markSignupRequests(
  supabase: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>,
  {
    adminMemberId,
    memberId,
    note,
    requestId,
    status
  }: {
    adminMemberId: string | null;
    memberId: string;
    note: string;
    requestId: string;
    status: "approved" | "rejected" | "held";
  }
) {
  const patch = {
    handled_by_member_id: adminMemberId,
    handled_at: new Date().toISOString(),
    note,
    status
  };

  if (requestId) {
    await supabase.from("admin_requests").update(patch).eq("id", requestId);
    return;
  }

  await supabase.from("admin_requests").update(patch).eq("member_id", memberId).eq("request_type", "signup").eq("status", "pending");
}
