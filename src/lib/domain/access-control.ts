import type { DashboardView } from "./interaction-state";
import type { RoleName } from "./mvp-program";

export type AppRole = "admin" | "director" | "member";
export type MemberStatus = "active" | "pending" | "blocked";
export type AuthState = "signed_out" | "active" | "pending" | "blocked";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type MemberRoleAssignment = {
  roleName: RoleName;
  isPrimary: boolean;
};

export type MemberProfile = {
  id: string;
  authUserId: string | null;
  email: string;
  displayName: string | null;
  appRole: AppRole;
  status: MemberStatus;
  roleAssignments: MemberRoleAssignment[];
};

export type ResolvedMemberProfile = {
  id: string | null;
  authUserId: string | null;
  email: string;
  displayName: string | null;
  appRole: AppRole;
  status: MemberStatus;
  roleNames: RoleName[];
  primaryRole: RoleName | null;
};

export type AuthContext = {
  state: AuthState;
  user: AuthUser | null;
  profile: ResolvedMemberProfile | null;
};

const memberViews: DashboardView[] = ["dashboard", "work", "submit", "drive"];
const directorViews: DashboardView[] = [...memberViews, "director"];
const adminViews: DashboardView[] = [...directorViews, "admin"];

export function buildSignedOutAuthContext(): AuthContext {
  return {
    state: "signed_out",
    user: null,
    profile: null
  };
}

export function buildAuthContext({ member, user }: { member: MemberProfile | null; user: AuthUser | null }): AuthContext {
  if (!user) return buildSignedOutAuthContext();

  if (!member) {
    return {
      state: "pending",
      user,
      profile: {
        id: null,
        authUserId: user.id,
        email: user.email,
        displayName: user.name ?? null,
        appRole: "member",
        status: "pending",
        roleNames: [],
        primaryRole: null
      }
    };
  }

  const primaryRole = resolvePrimaryRole(member.roleAssignments);
  const state: AuthState = member.status === "active" ? "active" : member.status;

  return {
    state,
    user,
    profile: {
      id: member.id,
      authUserId: member.authUserId,
      email: member.email,
      displayName: member.displayName,
      appRole: member.appRole,
      status: member.status,
      roleNames: member.roleAssignments.map((assignment) => assignment.roleName),
      primaryRole
    }
  };
}

export function canAccessView(context: AuthContext, view: DashboardView) {
  if (context.state !== "active" || !context.profile) return false;
  if (context.profile.appRole === "admin") {
    return adminViews.includes(view);
  }
  if (context.profile.appRole === "director") {
    return directorViews.includes(view);
  }
  return memberViews.includes(view);
}

export function getVisibleViews(context: AuthContext) {
  if (context.state !== "active" || !context.profile) return [] satisfies DashboardView[];
  if (context.profile.appRole === "admin") return adminViews;
  return context.profile.appRole === "director" ? directorViews : memberViews;
}

export function getPrimaryRole(context: AuthContext) {
  return context.profile?.primaryRole ?? null;
}

function resolvePrimaryRole(assignments: MemberRoleAssignment[]) {
  return assignments.find((assignment) => assignment.isPrimary)?.roleName ?? assignments[0]?.roleName ?? null;
}

export function chooseBootstrapMemberAccess(activeAdminCount: number): {
  appRole: AppRole;
  status: MemberStatus;
  defaultRoles: MemberRoleAssignment[];
} {
  if (activeAdminCount === 0) {
    return {
      appRole: "admin",
      status: "active",
      defaultRoles: [{ roleName: "Hikaru", isPrimary: true }]
    };
  }

  return {
    appRole: "member",
    status: "pending",
    defaultRoles: []
  };
}

export function canChangeTargetMember({
  activeAdminCount,
  currentAdminMemberId,
  nextAppRole,
  nextStatus,
  targetMemberId
}: {
  activeAdminCount: number;
  currentAdminMemberId: string;
  nextAppRole: AppRole;
  nextStatus: MemberStatus;
  targetMemberId: string;
}) {
  const removesOwnAdminAccess = currentAdminMemberId === targetMemberId && (nextAppRole !== "admin" || nextStatus !== "active");
  return !(activeAdminCount <= 1 && removesOwnAdminAccess);
}
