// The fixed set of gate-able feature areas in the admin panel. Roles are dynamic
// (admins can add/rename/delete them), but the permission keys themselves map to
// actual controllers/routes in the code, so this list only changes when a new
// admin feature area is added.
export const PERMISSION_KEYS = [
  'pages',
  'team',
  'careers',
  'reviews',
  'blog',
  'settings',
  'contact',
  'applications',
  'errorLogs',
  'activityLog',
  'users',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  pages: 'Content',
  team: 'Team',
  careers: 'Careers',
  reviews: 'Reviews',
  blog: 'Blog',
  settings: 'Settings',
  contact: 'Contact Enquiries',
  applications: 'Job Applications',
  errorLogs: 'Error Logs',
  activityLog: 'Activity Log',
  users: 'Users & Roles',
};

export function sanitizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const allowed = new Set<string>(PERMISSION_KEYS);
  return [...new Set(input.filter((p): p is string => typeof p === 'string' && allowed.has(p)))];
}
