import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, DisponibilidadReserva, Reserva } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly baseUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Reserva[]>> {
    return this.http.get<ApiResponse<Reserva[]>>(this.baseUrl);
  }

  getMine(): Observable<ApiResponse<Reserva[]>> {
    return this.http.get<ApiResponse<Reserva[]>>(`${this.baseUrl}/mis-reservas`);
  }

  checkDisponibilidad(params: {
    espacio_id: number;
    fecha_inicio: string;
    fecha_fin: string;
  }): Observable<ApiResponse<DisponibilidadReserva>> {
    return this.http.get<ApiResponse<DisponibilidadReserva>>(`${this.baseUrl}/disponibilidad`, { params: params as any });
  }

  getById(id: number): Observable<ApiResponse<Reserva>> {
    return this.http.get<ApiResponse<Reserva>>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<Reserva>): Observable<ApiResponse<Reserva>> {
    return this.http.post<ApiResponse<Reserva>>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Reserva>): Observable<ApiResponse<Reserva>> {
    return this.http.put<ApiResponse<Reserva>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/${id}`);
  }

  aprobar(id: number, observacion?: string): Observable<ApiResponse<Reserva>> {
    return this.http.patch<ApiResponse<Reserva>>(`${this.baseUrl}/${id}/aprobar`, { observacion });
  }

  rechazar(id: number, observacion?: string): Observable<ApiResponse<Reserva>> {
    return this.http.patch<ApiResponse<Reserva>>(`${this.baseUrl}/${id}/rechazar`, { observacion });
  }

  cancelar(id: number, observacion?: string): Observable<ApiResponse<Reserva>> {
    return this.http.patch<ApiResponse<Reserva>>(`${this.baseUrl}/${id}/cancelar`, { observacion });
  }
}
