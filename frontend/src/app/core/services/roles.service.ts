import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Rol } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly baseUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Rol[]>> {
    return this.http.get<ApiResponse<Rol[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ApiResponse<Rol>> {
    return this.http.get<ApiResponse<Rol>>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Rol>): Observable<ApiResponse<Rol>> {
    return this.http.post<ApiResponse<Rol>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Rol>): Observable<ApiResponse<Rol>> {
    return this.http.put<ApiResponse<Rol>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
