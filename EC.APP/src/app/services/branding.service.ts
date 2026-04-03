import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { IBranding } from '../models/branding';

const apiUrl = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root',
})
export class BrandingService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  getBranding(brandingFor: 'admin' | 'client'): Observable<IBranding> {
    return this.http
      .get<any>(`${apiUrl}/Branding/GetBranding?BrandingFor=${brandingFor}`, { headers: this.headers })
      .pipe(map((response: any) => response.result));
  }

  saveBranding(brandingFor: 'admin' | 'client', data: IBranding): Observable<any> {
    return this.http.post<any>(`${apiUrl}/Branding/SaveBranding`, { ...data, brandingFor }, { headers: this.headers });
  }
}
