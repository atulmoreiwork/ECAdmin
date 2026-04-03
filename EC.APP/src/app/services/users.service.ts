import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, delay, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUsers } from '../models/admin-users';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) { }

  getAllRoles(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Role/GetAllRoles", data, { headers: this.headers });
  }

  getUsers(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Users/GetAllUsers", data, { headers: this.headers });
  }
  addUpdateUser(data: any): Observable<any> {
    return this.http.post(apiUrl + '/Users/AddUpdateUser', data, {
      headers: this.headers,
    });
  }
  deleteUserById(params: any): Observable<any> {
    return this.http.get<any>(apiUrl + "/Users/DeleteUserById?UserId=" +params, { headers: this.headers});
  }
  uploadExcel(formData: FormData): Observable<Blob> {
    return this.http.post(`${apiUrl}/Users/Upload`, formData, {
      responseType: 'blob', // 👈 expect binary file
    });
  }

  getUser(id: number): Observable<IUsers> {
    if (id === 0) {
      return of(this.initializedClient());
    } else {
      return this.http
        .get<IUsers>(apiUrl + '/Users/GetUserById?UserId=' + id, {
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

  private initializedClient(): IUsers {
    return {
      userId: 0,
      roleId: 0,
      roleName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      status: '',
      row: '',
      totalRowCount: '',
      flag: 0
    };
  }
}
