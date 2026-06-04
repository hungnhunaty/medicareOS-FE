import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (isPlatformBrowser(platformId)) {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && userInfo.token) {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${userInfo.token}`
            }
          });
        }
      } catch (e) {
        console.error('Error parsing userInfo in jwtInterceptor:', e);
      }
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token has expired or is invalid, clear storage and redirect
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('userInfo');
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
