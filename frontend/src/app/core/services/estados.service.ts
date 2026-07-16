import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Estado } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadosService {
  private readonly baseUrl = `${environment.apiUrl}/estados`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Estado[]>> {
    return this.http.get<ApiResponse<Estado[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ApiResponse<Estado>> {
    return this.http.get<ApiResponse<Estado>>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Estado>): Observable<ApiResponse<Estado>> {
    return this.http.post<ApiResponse<Estado>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Estado>): Observable<ApiResponse<Estado>> {
    return this.http.put<ApiResponse<Estado>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
