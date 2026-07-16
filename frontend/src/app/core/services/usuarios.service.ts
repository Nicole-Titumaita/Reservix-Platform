import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Usuario } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly baseUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Usuario> & { password?: string }): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Usuario> & { password?: string }): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
