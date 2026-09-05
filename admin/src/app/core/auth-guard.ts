import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('admin_token');
  if (token) return true;
  router.navigate(['/login']);
  return false;
};

// Any one of the given permission keys grants access. Use with no keys for
// "just needs to be logged in" (e.g. dashboard, my account).
export function permissionGuard(...keys: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.getToken()) {
      router.navigate(['/login']);
      return false;
    }
    if (keys.length === 0 || auth.hasPermission(...keys)) return true;
    router.navigate(['/dashboard']);
    return false;
  };
}
