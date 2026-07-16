import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  const allowedRoles = (route.data['roles'] as string[] | undefined) ?? [];
  if (allowedRoles.length === 0) {
    return true;
  }

  if (!role || !allowedRoles.includes(role)) {
    router.navigate([auth.getLandingPathForRole(role || '')]);
    return false;
  }
  return true;
};
