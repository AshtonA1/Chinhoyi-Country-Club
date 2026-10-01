import { ROLES, type PermissionAction, type PermissionModule, type RoleId } from '@/data/club';

/** In this prototype the signed-in admin's role is fixed; wire this to real auth later. */
export const CURRENT_ADMIN_ROLE: RoleId = 'super_admin';

export function getRole(roleId: RoleId) {
  return ROLES.find((role) => role.id === roleId) ?? ROLES[0];
}

export function can(roleId: RoleId, moduleId: PermissionModule, action: PermissionAction): boolean {
  const role = getRole(roleId);
  return role.permissions[moduleId]?.includes(action) ?? false;
}

export function useCan(moduleId: PermissionModule, action: PermissionAction): boolean {
  return can(CURRENT_ADMIN_ROLE, moduleId, action);
}
