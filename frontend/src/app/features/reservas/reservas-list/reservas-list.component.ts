import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservasService } from '../../../core/services/reservas.service';
import { Reserva } from '../../../core/models';

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservas-list.component.html',
  styleUrls: ['./reservas-list.component.scss']
})
export class ReservasListComponent implements OnInit {
  items: Reserva[] = [];
  readonly role = localStorage.getItem('role') || '';

  constructor(private reservasService: ReservasService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const request$ = this.isAdmin ? this.reservasService.getAll() : this.reservasService.getMine();
    request$.subscribe({
      next: (response) => (this.items = response.data ?? [])
    });
  }

  edit(id: number): void {
    this.router.navigate([this.isAdmin ? '/reservas/editar' : '/mis-reservas/editar', id]);
  }

  get isAdmin(): boolean {
    return this.role === 'ADMINISTRADOR';
  }

  get createPath(): string {
    return this.isAdmin ? '/reservas/nueva' : '/mis-reservas/nueva';
  }

  approve(id: number): void {
    if (!confirm('Aprobar esta reserva?')) return;
    this.reservasService.aprobar(id).subscribe({ next: () => this.load() });
  }

  reject(id: number): void {
    if (!confirm('Rechazar esta reserva?')) return;
    this.reservasService.rechazar(id).subscribe({ next: () => this.load() });
  }

  cancel(id: number): void {
    if (!confirm('Cancelar esta reserva?')) return;
    this.reservasService.cancelar(id).subscribe({ next: () => this.load() });
  }

  canApproveOrReject(item: Reserva): boolean {
    return this.isAdmin && this.normalizeEstado(item) === 'PENDIENTE';
  }

  canCancel(item: Reserva): boolean {
    const estado = this.normalizeEstado(item);
    return estado === 'PENDIENTE' || (this.isAdmin && estado === 'APROBADA');
  }

  canEdit(item: Reserva): boolean {
    return this.normalizeEstado(item) === 'PENDIENTE';
  }

  estadoClass(item: Reserva): string {
    const estado = this.normalizeEstado(item);
    if (estado === 'APROBADA') return 'bg-emerald-50 text-emerald-700';
    if (estado === 'RECHAZADA') return 'bg-red-50 text-red-700';
    if (estado === 'CANCELADA') return 'bg-slate-100 text-slate-600';
    return 'bg-amber-50 text-amber-700';
  }

  private normalizeEstado(item: Reserva): string {
    return String(item.estado_nombre || item.estado_id || '').toUpperCase();
  }
}
