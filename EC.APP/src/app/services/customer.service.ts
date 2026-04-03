
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICustomer } from '../models/customer.model';

const apiUrl = `${environment.apiUrl}`; 

@Injectable({
  providedIn: 'root',
})
export class CustomerService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) {
    console.log('HttpClient injected:', this.http);
  }

  getCustomers(): Observable<any> {
    return this.http.get<any>(apiUrl + "/Customer/GetCustomers");
  }

  getAllCustomers(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Customer/GetAllCustomers", data, { headers: this.headers });
  }

  deleteCustomerById(CustomerId: number): Observable<any> {
    return this.http.get<any>(apiUrl + "/Customer/DeleteCustomerById?CustomerId="+ CustomerId, { headers: this.headers });
  }

  addUpdateCustomer(data: any): Observable<any> {
    return this.http.post(apiUrl + '/Customer/AddUpdateCustomer', data, {
      headers: this.headers,
    });
  }
  getCustomer(id: number): Observable<ICustomer> {
    if (id === 0) {
      return of(this.initializedClient());
    } else {
      return this.http
        .get<ICustomer>(apiUrl + '/Customer/GetCustomerById?CustomerId=' + id, {
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

  private initializedClient(): ICustomer {
    return {
      customerId: 0,
      firstName: '',
      lastName:'',
      status: '',
      address: '',
      city:'',
      postalCode:'',
      state:'',
      country:'',
      phoneNumber: '',
      email:'',
      password:'',
      row: '',
      totalRowCount:'',
      flag: 0
    };
  }
}