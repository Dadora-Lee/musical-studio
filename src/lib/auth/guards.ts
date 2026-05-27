import { canAccessView, type AppRole, type AuthContext } from "@/lib/domain/access-control";
import type { DashboardView } from "@/lib/domain/interaction-state";

export function requireActiveMember(context: AuthContext) {
  if (context.state !== "active" || !context.profile) {
    throw new Error("Active member session required.");
  }
  return context.profile;
}

export function requireAppRole(context: AuthContext, roles: AppRole[]) {
  const profile = requireActiveMember(context);
  if (!roles.includes(profile.appRole)) {
    throw new Error("Insufficient app role.");
  }
  return profile;
}

export function requireViewAccess(context: AuthContext, view: DashboardView) {
  if (!canAccessView(context, view)) {
    throw new Error(`View access denied: ${view}`);
  }
  return requireActiveMember(context);
}
