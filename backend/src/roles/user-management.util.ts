import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from './role.entity';

interface CountOptions {
  /** Pretend this user doesn't exist (e.g. checking a pending delete). */
  excludeUserId?: string;
  /** Pretend this user is assigned to a different role name (checking a pending role change). */
  userRoleOverride?: { userId: string; roleName: string };
  /** Pretend this role has a different permission list (checking a pending role edit). */
  rolePermissionsOverride?: { roleId: string; permissions: string[] };
}

// Counts how many users would hold `permission` if the given pending change were applied.
// Used to stop an admin from saving a change that would leave nobody able to manage
// users/roles at all — a self-inflicted lockout with no way back in through the UI.
export async function countUsersWithPermission(
  userRepo: Repository<User>,
  roleRepo: Repository<Role>,
  permission: string,
  opts: CountOptions = {},
): Promise<number> {
  const [users, roles] = await Promise.all([userRepo.find(), roleRepo.find()]);

  const permsByRoleName = new Map<string, string[]>(
    roles.map((r) => [
      r.name,
      opts.rolePermissionsOverride && r.id === opts.rolePermissionsOverride.roleId
        ? opts.rolePermissionsOverride.permissions
        : r.permissions,
    ]),
  );

  return users.filter((u) => {
    if (opts.excludeUserId && u.id === opts.excludeUserId) return false;
    const roleName =
      opts.userRoleOverride && u.id === opts.userRoleOverride.userId
        ? opts.userRoleOverride.roleName
        : u.role;
    return permsByRoleName.get(roleName)?.includes(permission) ?? false;
  }).length;
}
