
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { IOrder, IOrderShippingAddress } from '../models/order.model';
import { ICustomer } from '../models/customer.model';
const apiUrl = `${environment.apiUrl}`; 

@Injectable({
  providedIn: 'root',
})
export class OrderService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) {
    console.log('HttpClient injected:', this.http);
  }

  getAllOrders(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Order/GetAllOrders", data, { headers: this.headers });
  }

  addUpdateOrder(data: any): Observable<any> {
    return this.http.post(apiUrl + '/Order/AddUpdateOrder', data);
  }

  deleteOrderById(orderId: any): Observable<any> {
    return this.http.get<any>(apiUrl + "/Order/DeleteOrderById?OrderId="+ orderId, { headers: this.headers});
  }

  getOrder(id: number): Observable<IOrder> {
    if (id === 0) {
      return of(this.initializedClient());
    } else {
      return this.http
        .get<IOrder>(apiUrl + '/Order/GetOrderById?OrderId=' + id, {
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

  private initializedClient(): IOrder {
    return {
        orderId: 0,
        orderNumber: '',
        customerId: 0,
        categoryId:0,
        orderShippingAddressId: 0,
        customerName: '',
        totalAmount: '',
        discountAmount: '',
        grossAmount:'',
        shippingAmount: '',
        netAmount: '',
        status:'',
        paymentStatus:'',
        paymentType:'',
        paymentTransactionId:'',
        customer: {} as ICustomer,
        orderShippingAddress: {} as IOrderShippingAddress,
        orderItems: [],
        row: '',
        totalRowCount:'',
        flag: 0
    };
  }
}