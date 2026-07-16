import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private readonly baseUrl = `${environment.apiUrl}/historial`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<unknown[]>> {
    return this.http.get<ApiResponse<unknown[]>>(this.baseUrl);
  }

  getMine(): Observable<ApiResponse<unknown[]>> {
    return this.http.get<ApiResponse<unknown[]>>(`${this.baseUrl}/mi-historial`);
  }

  getByReservaId(reservaId: number): Observable<ApiResponse<unknown[]>> {
    return this.http.get<ApiResponse<unknown[]>>(`${this.baseUrl}/reserva/${reservaId}`);
  }
}
