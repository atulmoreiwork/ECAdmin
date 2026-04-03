import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../src/environments/environment';
import { TokenResponse } from '../models/login';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  private readonly apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) { }

  private normalizeTokenResponse(response: any): TokenResponse {
    const userClaimData = response?.userClaimData ?? response?.UserClaimData ?? {};
    return {
      accessToken: response?.accessToken ?? response?.AccessToken ?? '',
      refreshToken: response?.refreshToken ?? response?.RefreshToken ?? '',
      userClaimData: {
        userId: userClaimData?.userId ?? userClaimData?.UserId ?? '',
        name: userClaimData?.name ?? userClaimData?.Name ?? '',
        loginName: userClaimData?.loginName ?? userClaimData?.LoginName ?? '',
        role: userClaimData?.role ?? userClaimData?.Role,
        tenantId:
          userClaimData?.tenantId ??
          userClaimData?.TenantId ??
          userClaimData?.tenantID ??
          userClaimData?.TenantID
      }
    };
  }

  login(loginRequest: any): Observable<TokenResponse> {
    const timestamp = new Date().getTime();
    const apiUrlWithTimestamp = `${this.apiUrl}/Account/Login`; //?timestamp=${timestamp}
    return this.http
      .post<any>(apiUrlWithTimestamp, loginRequest)
      .pipe(map((response) => this.normalizeTokenResponse(response)));
  }
  
  refreshToken(session: TokenResponse): Observable<TokenResponse> {
    const payload = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    };
    return this.http
      .post<any>(`${environment.apiUrl}/Account/Refresh`, payload)
      .pipe(map((response) => this.normalizeTokenResponse(response)));
  }
}
