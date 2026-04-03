
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { ICategory } from '../models/category.model';
import { environment } from '../../environments/environment';

const apiUrl = `${environment.apiUrl}`; 

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) {
    console.log('HttpClient injected:', this.http);
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(apiUrl + "/Category/GetCategories");
  }

  getAllCategory(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Category/GetAllCategories", data, { headers: this.headers });
  }
  getParentCategories(): Observable<any> {
    return this.http.get<any>(apiUrl + "/Category/GetParentCategories", { headers: this.headers });
  }

  deleteCategoryById(CategoryId: number): Observable<any> {
    return this.http.get<any>(apiUrl + "/Category/DeleteCategoryById?CategoryId="+ CategoryId, { headers: this.headers });
  }

  addUpdateCategory(data: any): Observable<any> {
    return this.http.post(apiUrl + '/Category/AddUpdateCategory', data, {
      headers: this.headers,
    });
  }
  getCategory(id: number): Observable<ICategory> {
    if (id === 0) {
      return of(this.initializedClient());
    } else {
      return this.http
        .get<ICategory>(apiUrl + '/Category/GetCategoryById?CategoryId=' + id, {
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

  private initializedClient(): ICategory {
    return {
      categoryId: 0,
      categoryName: '',
      urlSlug:'',
      description: '',
      parentCategoryId: 0,
      status:'',
      row: '',
      totalRowCount:'',
      flag: 0
    };
  }
}