import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ITenant } from '../models/tenant';


const apiUrl = `${environment.apiUrl}`;

@Injectable({
    providedIn: 'root',
})
export class TenantService {

    headers = new HttpHeaders().set('Content-Type', 'application/json');

    constructor(private http: HttpClient, public router: Router) {
        console.log('TenantService Loaded');
    }

    // ✅ Get All Tenants (Simple)
    getTenants(): Observable<any> {
        return this.http.get<any>(apiUrl + "/Tenant/GetTenants");
    }

    // ✅ Grid Pagination + Filters
    getAllTenants(data: any): Observable<any> {
        return this.http.post<any>(
            apiUrl + "/Tenant/GetAllTenants",
            data,
            { headers: this.headers }
        );
    }

    // ✅ Delete
    deleteTenantById(tenantId: number): Observable<any> {
        return this.http.get<any>(
            apiUrl + "/Tenant/DeleteTenant?TenantId=" + tenantId,
            { headers: this.headers }
        );
    }

    // ✅ Add / Update
    addUpdateTenant(data: ITenant): Observable<any> {
        return this.http.post(
            apiUrl + '/Tenant/AddUpdateTenant',
            data,
            { headers: this.headers }
        );
    }

    // ✅ Get By Id
    getTenant(id: number): Observable<ITenant> {

        if (id === 0) {
            return of(this.initializeTenant());
        }

        return this.http
            .get<ITenant>(
                apiUrl + '/Tenant/GetTenantById?TenantId=' + id,
                { headers: this.headers }
            )
            .pipe(
                map((response: any) => response.result),
                catchError((err: any) => {
                    console.error('Tenant Load Error:', err);
                    throw err;
                })
            );
    }

    // ✅ Default Object (VERY IMPORTANT for forms)
    private initializeTenant(): ITenant {
        return {
            tenantId: 0,
            id: '',
            name: '',
            domain: '',
            plans: 'Starter',
            status: 'Active',
            users: 0,
            maxUsers: 5,
            storageLimitGB: 10,
            subscriptionStart: '',
            subscriptionEnd: '',
            row: 0,
            totalRowCount: 0,
            flag: 0
        };
    }
}
