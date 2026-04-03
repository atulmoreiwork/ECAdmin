
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';


const apiUrl = `${environment.apiUrl}`; 

@Injectable({
  providedIn: 'root',
})
export class DocumentService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient, public router: Router) {
    console.log('HttpClient injected:', this.http);
  }

  getAllDocuments(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Document/GetAllDocument", data, { headers: this.headers });
  }

  getDocuments(params: any): Observable<any> {
    return this.http.get<any>(apiUrl + "/Document/GetDocuments", { headers: this.headers, params: params });
  } 

  getDocumentById(params: any): Observable<any> {
    return this.http.get<any>(apiUrl + "/Document/GetDocumentById", { headers: this.headers, params: params });
  }

  getDocumentFile(documentId: number): Observable<Blob> {
    return this.http.get(apiUrl + "/Document/GetDocumentFile?DocumentId=" + documentId, {
      responseType: 'blob'
    });
  }
}
