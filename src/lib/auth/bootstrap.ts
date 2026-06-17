import type { User } from "@supabase/supabase-js";
import { chooseBootstrapMemberAccess } from "@/lib/domain/access-control";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

export async function ensureMemberForAuthenticatedUser(user: User) {
  if (!user.email) return;

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) return;

  const email = user.email.toLowerCase();
  const { data: existing } = await supabase.from("members").select("id").eq("email", email).maybeSingle<{ id: string }>();
  if (existing) {
    await supabase.from("members").update({ auth_user_id: user.id }).eq("id", existing.id).is("auth_user_id", null);
    return;
  }

  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("app_role", "admin")
    .eq("status", "active");

  const access = chooseBootstrapMemberAccess(count ?? 0);
  const displayName = user.user_metadata?.name ?? user.user_metadata?.full_name ?? null;
  const { data: member } = await supabase
    .from("members")
    .insert({
      auth_user_id: user.id,
      display_name: displayName,
      email,
      app_role: access.appRole,
      status: access.status
    })
    .select("id")
    .single<{ id: string }>();

  if (member && access.defaultRoles.length > 0) {
    const { data: catalogRoles } = await supabase
      .from("musical_roles")
      .select("id, display_name")
      .in(
        "display_name",
        access.defaultRoles.map((assignment) => assignment.roleName)
      )
      .returns<{ id: string; display_name: string }[]>();

    await supabase.from("member_role_assignments").insert(
      access.defaultRoles.map((assignment) => ({
        member_id: member.id,
        role_id: catalogRoles?.find((role) => role.display_name === assignment.roleName)?.id ?? null,
        role_name: assignment.roleName,
        is_primary: assignment.isPrimary
      }))
    );
  }

  if (member && access.status === "pending") {
    await supabase.from("admin_requests").insert({
      member_id: member.id,
      request_type: "signup",
      status: "pending",
      requested_by_email: email,
      note: "Google login signup request"
    });
  }
}
