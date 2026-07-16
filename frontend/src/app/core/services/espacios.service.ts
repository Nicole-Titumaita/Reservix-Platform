import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Espacio } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EspaciosService {
  private readonly baseUrl = `${environment.apiUrl}/espacios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Espacio[]>> {
    return this.http.get<ApiResponse<Espacio[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ApiResponse<Espacio>> {
    return this.http.get<ApiResponse<Espacio>>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Espacio>): Observable<ApiResponse<Espacio>> {
    return this.http.post<ApiResponse<Espacio>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Espacio>): Observable<ApiResponse<Espacio>> {
    return this.http.put<ApiResponse<Espacio>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
