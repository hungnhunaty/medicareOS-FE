import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Decode base64url payload with UTF-8 support
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(payloadBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    if (!payload || !payload.exp) return false; // If no exp claim, assume valid

    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= payload.exp;
  } catch (e) {
    return true; // Treat as expired if decoding fails
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);


  if (!isPlatformBrowser(platformId)) {
    return true; // Allow initial SSR matching
  }

  const userInfoStr = localStorage.getItem('userInfo');

  if (!userInfoStr) {
    return router.createUrlTree(['/login']);
  }

  try {

    const userInfo = JSON.parse(userInfoStr);

    // Check if token exists and is valid (not expired)
    if (!userInfo || !userInfo.token || isTokenExpired(userInfo.token)) {
      localStorage.removeItem('userInfo'); // Clear invalid/expired info
      return router.createUrlTree(['/login']);
    }

    // Check role/userType matches route requirements
    const expectedRoles: string[] = route.data['roles'];
    if (expectedRoles && expectedRoles.length > 0) {
      const userRole = userInfo.userType; // E.g., "Admin", "Doctor", "Staff", "Patient" (User)
      const hasRole = expectedRoles.some(role => role.toLowerCase() === userRole.toLowerCase());

      if (!hasRole) {
        return router.createUrlTree(['/reject']);
      }
    }

    return true;
  } catch (e) {
    console.error('Error parsing userInfo in authGuard:', e);
    localStorage.removeItem('userInfo');
    return router.createUrlTree(['/login']);
  }
};
