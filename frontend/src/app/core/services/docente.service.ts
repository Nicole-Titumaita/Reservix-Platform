import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, DisponibilidadReserva, DocenteDashboardData, DocenteDashboardHistorial, Reserva } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocenteService {
  private readonly baseUrl = `${environment.apiUrl}/docente`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<DocenteDashboardData>> {
    return this.http.get<ApiResponse<DocenteDashboardData>>(`${this.baseUrl}/dashboard`);
  }

  getReservas(): Observable<ApiResponse<Reserva[]>> {
    return this.http.get<ApiResponse<Reserva[]>>(`${this.baseUrl}/reservas`);
  }

  getHistorial(): Observable<ApiResponse<DocenteDashboardHistorial[]>> {
    return this.http.get<ApiResponse<DocenteDashboardHistorial[]>>(`${this.baseUrl}/historial`);
  }

  getDisponibilidad(params: { espacio_id: number; fecha_inicio: string; fecha_fin: string }): Observable<ApiResponse<DisponibilidadReserva>> {
    return this.http.get<ApiResponse<DisponibilidadReserva>>(`${this.baseUrl}/disponibilidad`, { params: params as any });
  }
}
