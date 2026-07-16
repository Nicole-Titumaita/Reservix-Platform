import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Horario } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private readonly baseUrl = `${environment.apiUrl}/horarios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Horario[]>> {
    return this.http.get<ApiResponse<Horario[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ApiResponse<Horario>> {
    return this.http.get<ApiResponse<Horario>>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Horario>): Observable<ApiResponse<Horario>> {
    return this.http.post<ApiResponse<Horario>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Horario>): Observable<ApiResponse<Horario>> {
    return this.http.put<ApiResponse<Horario>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }
}
