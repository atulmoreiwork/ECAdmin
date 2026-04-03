
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { IProduct } from '../models/product.model';

const apiUrl = `${environment.apiUrl}`; 

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) {
    console.log('HttpClient injected:', this.http);
  }

  getAllProducts(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Product/GetAllProducts", data, { headers: this.headers });
  }

  getProducts(): Observable<any> {
    return this.http.get<any>(apiUrl + "/Product/GetProducts", { headers: this.headers });
  }  

  deleteProductById(params: any): Observable<any> {
    return this.http.get<any>(apiUrl + "/Product/DeleteProductById", { headers: this.headers, params: params });
  }
  getProductByCategoryId(params: any): Observable<any> {
    return this.http.get<any>(apiUrl + "/Product/GetProductByCategoryId", { headers: this.headers, params: params });
  }
  
  getProductsByIds(productIds: number[]): Observable<any> {
    // Make sure to send the array as JSON body
    return this.http.post(`${apiUrl}/Product/GetProductsByIds`, productIds);
  }

  // addUpdateProduct(data: any): Observable<any> {
  //   return this.http.post(apiUrl + '/Product/AddUpdateProduct', data);
  // }
  
  addUpdateProduct(formData: FormData): Observable<any> {
    return this.http.post(`${apiUrl}/Product/AddUpdateProduct`, formData);
  }

  getProduct(id: number): Observable<IProduct> {
    if (id === 0) {
      return of(this.initializedClient());
    } else {
      return this.http
        .get<IProduct>(apiUrl + '/Product/GetProductById?ProductId=' + id, {
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

  private initializedClient(): IProduct {
    return {
      productId: 0,
      productName: '',
      urlSlug:'',
      description: '',
      categoryId: 0,
      price: 0,
      stockQuantity: 0,
      status:'',
      productVariants: [],
      row: '',
      totalRowCount:'',
      flag: 0
    };
  }
}