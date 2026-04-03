import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { IRole } from '../models/admin-users';

const apiUrl = `${environment.apiUrl}`; 
@Injectable({
  providedIn: 'root'
})
export class RoleService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) {}
  

  getRoles(): Observable<any> {
    return this.http.get<any>(apiUrl + "/Role/GetRoles");
  }

  getAllRoles(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Role/GetAllRoles", data, { headers: this.headers });
  }

  deleteRoleById(params: any): Observable<any> {
    return this.http.get<any>(apiUrl + "/Role/DeleteRoleById?RoleId=" +params, { headers: this.headers});
  }

  addUpdateRole(data: any): Observable<any> {
    return this.http.post(apiUrl + '/Role/AddUpdateRole', data, {
      headers: this.headers,
    });
  }
  
  getRole(id: number): Observable<IRole> {
    if (id === 0) {
      return of(this.initializedClient());
    } else {
      return this.http
        .get<IRole>(apiUrl + '/Role/GetRoleById?RoleId=' + id, {
          headers: this.headers,
        })
        .pipe(
          map((response: any) => {
            return response.result;
          }),
          catchError((err: any, caught: any) => {
            console.error(err);
            throw err;
          })
        );
    }
  }

  private initializedClient(): IRole {
    return {
      roleId: 0,
      roleName: '',
      roleDescription:'',
      userCount: 0,
      row: '',
      totalRowCount:'',
      flag: 0
    };
  }
}
