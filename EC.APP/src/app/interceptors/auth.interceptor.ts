import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { environment } from '../../environments/environment';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const ngZone = inject(NgZone);

  const session = tokenService.getSession();
  const isApiCall = req.url.includes(environment.apiUrl); // ✅ safer than startsWith()

  let clonedReq = req;

  if (isApiCall && session?.accessToken) {
    const tenantId =
      session?.userClaimData?.tenantId ??
      (session?.userClaimData as any)?.TenantId ??
      '';

    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.accessToken}`,
        'X-Tenant-Id': tenantId ? String(tenantId) : '',
      },
    });
  }

  return next(clonedReq).pipe(
    catchError((error) => {
      const is401 = error.status === 401;
      const isAuthEndpoint = /\/(login|refresh|refreshtoken)$/i.test(req.url);

      // Only refresh if 401 and not on login/refresh endpoints
      if (is401 && !isAuthEndpoint) {
        const refreshSession = tokenService.getSession();
        if (refreshSession?.refreshToken) {
          console.log('[AuthInterceptor] Attempting token refresh...');

          return tokenService.refreshToken().pipe(
            switchMap((newToken) => {
              console.log('[AuthInterceptor] Token refreshed');
              tokenService.saveSessionInLocal(newToken);

              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken.accessToken}`,
                  'X-Tenant-Id': String(
                    newToken?.userClaimData?.tenantId ??
                    (newToken?.userClaimData as any)?.TenantId ??
                    ''
                  ),
                },
              });

              return next(retryReq);
            }),
            catchError((refreshError) => {
              console.error('[AuthInterceptor] Refresh failed', refreshError);
              tokenService.removeSessionInLocal();
              ngZone.run(() => router.navigate(['/login']));
              return throwError(() => refreshError);
            })
          );
        } else {
          console.warn('[AuthInterceptor] No refresh token available, logout');
          tokenService.removeSessionInLocal();
          ngZone.run(() => router.navigate(['/login']));
        }
      }

      return throwError(() => error);
    })
  );
};
