import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Recurso, RecursoMovimiento } from '../models';
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

  getMovements(): Observable<ApiResponse<RecursoMovimiento[]>> {
    return this.http.get<ApiResponse<RecursoMovimiento[]>>(`${this.baseUrl}/movimientos`);
  }

  getMovementsByResourceId(recursoId: number, rolNombre?: string, accion?: string): Observable<ApiResponse<RecursoMovimiento[]>> {
    const params = new URLSearchParams();
    if (rolNombre) params.set('rol_nombre', rolNombre);
    if (accion) params.set('accion', accion);
    const query = params.toString();
    return this.http.get<ApiResponse<RecursoMovimiento[]>>(
      `${this.baseUrl}/movimientos/${recursoId}${query ? `?${query}` : ''}`
    );
  }

  getMovementsByRole(rolNombre: string): Observable<ApiResponse<RecursoMovimiento[]>> {
    return this.http.get<ApiResponse<RecursoMovimiento[]>>(`${this.baseUrl}/movimientos?rol_nombre=${encodeURIComponent(rolNombre)}`);
  }

  getMovementsByAction(accion: string): Observable<ApiResponse<RecursoMovimiento[]>> {
    return this.http.get<ApiResponse<RecursoMovimiento[]>>(`${this.baseUrl}/movimientos?accion=${encodeURIComponent(accion)}`);
  }

  getMovementsByRoleAndAction(rolNombre: string, accion: string): Observable<ApiResponse<RecursoMovimiento[]>> {
    const params = new URLSearchParams({
      rol_nombre: rolNombre,
      accion
    });
    return this.http.get<ApiResponse<RecursoMovimiento[]>>(`${this.baseUrl}/movimientos?${params.toString()}`);
  }

  createMovement(payload: Partial<RecursoMovimiento>): Observable<ApiResponse<RecursoMovimiento>> {
    return this.http.post<ApiResponse<RecursoMovimiento>>(`${this.baseUrl}/movimientos`, payload);
  }
}
