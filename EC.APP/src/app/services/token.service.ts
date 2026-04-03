import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenResponse } from '../models/login';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private session: TokenResponse | null = null;

  constructor(private authService: AuthService) {
    this.loadSessionFromLocal();
  }

  /** Load saved session from localStorage on startup */
  private loadSessionFromLocal(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userClaimData = localStorage.getItem('userClaimData');

    if (accessToken && refreshToken && userClaimData) {
      try {
        this.session = {
          accessToken,
          refreshToken,
          userClaimData: JSON.parse(userClaimData),
        };
      } catch (err) {
        console.error('[TokenService] Failed to parse userClaimData', err);
        this.session = null;
      }
    }
  }

  /** Persist session to localStorage */
  saveSessionInLocal(tokenResponse: TokenResponse): void {
    this.session = tokenResponse;
    localStorage.setItem('accessToken', tokenResponse.accessToken);
    localStorage.setItem('refreshToken', tokenResponse.refreshToken);
    localStorage.setItem('userClaimData', JSON.stringify(tokenResponse.userClaimData));
  }

  /** Clear localStorage */
  removeSessionInLocal(): void {
    this.session = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userClaimData');
  }

  /** Return current session (or null) */
  getSession(): TokenResponse | null {
    return this.session;
  }

  /** Whether user is logged in */
  isLoggedIn(): boolean {
    return !!this.session?.accessToken;
  }

  /** Common helpers */
  getUserName(): string | null {
    return this.session?.userClaimData?.name ?? null;
  }

  getUserLoginName(): string | null {
    return this.session?.userClaimData?.loginName ?? null;
  }

  getUserId(): string | null {
    return this.session?.userClaimData?.userId ?? null;
  }

  getTenantId(): number {
    const claim = this.session?.userClaimData as any;
    const rawValue =
      claim?.tenantId ??
      claim?.TenantId ??
      claim?.tenantID ??
      claim?.TenantID ??
      0;

    const tenantId = Number(rawValue);
    return Number.isFinite(tenantId) ? tenantId : 0;
  }

  /** Call backend refresh endpoint */
  refreshToken(): Observable<TokenResponse> {
    if (!this.session?.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.authService.refreshToken({
      refreshToken: this.session.refreshToken,
      accessToken: this.session.accessToken,
      userClaimData: this.session.userClaimData
    });
  }
}
