import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Recurso } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecursosService {
  private readonly baseUrl = `${environment.apiUrl}/recursos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Recurso[]>> {
    return this.http.get<ApiResponse<Recurso[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ApiResponse<Recurso>> {
    return this.http.get<ApiResponse<Recurso>>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Recurso>): Observable<ApiResponse<Recurso>> {
    return this.http.post<ApiResponse<Recurso>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Recurso>): Observable<ApiResponse<Recurso>> {
    return this.http.put<ApiResponse<Recurso>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
