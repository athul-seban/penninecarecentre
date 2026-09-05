import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'requiredPermissions';

// Any one of the listed permission keys grants access. Must be paired with
// PermissionsGuard (after JwtAuthGuard) — the decorator alone enforces nothing.
export const RequirePermission = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
