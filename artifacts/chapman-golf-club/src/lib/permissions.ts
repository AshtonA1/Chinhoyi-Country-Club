import { ROLES, type PermissionAction, type PermissionModule, type RoleId } from '@/data/club';
import { useAuth } from '@/lib/auth';

export function getRole(roleId: RoleId | 'none') {
  return ROLES.find((role) => role.id === roleId);
}

/** An unknown role, a member, or a signed-out visitor has no admin permissions at all. */
export function can(roleId: RoleId | 'none', moduleId: PermissionModule, action: PermissionAction): boolean {
  return getRole(roleId)?.permissions[moduleId]?.includes(action) ?? false;
}

/** Permission check for the signed-in staff member (everything is allowed in demo mode). */
export function useCan(moduleId: PermissionModule, action: PermissionAction): boolean {
  const { role } = useAuth();
  return can(role, moduleId, action);
}
