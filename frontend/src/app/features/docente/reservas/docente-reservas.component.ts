import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendarRange, LucideClock3, LucideHistory, LucidePlus } from '@lucide/angular';
import { Reserva } from '../../../core/models';
import { DocenteService } from '../../../core/services/docente.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ReservasService } from '../../../core/services/reservas.service';

@Component({
  selector: 'app-docente-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideCalendarRange, LucideClock3, LucideHistory, LucidePlus],
  templateUrl: './docente-reservas.component.html',
  styleUrls: ['./docente-reservas.component.scss']
})
export class DocenteReservasComponent implements OnInit {
  loading = true;
  reservas: Reserva[] = [];

  constructor(
    private docenteService: DocenteService,
    private reservasService: ReservasService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.docenteService.getReservas().subscribe({
      next: (response) => {
        this.reservas = response.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudieron cargar tus reservas');
      }
    });
  }

  cancelar(reservaId: number): void {
    this.reservasService.cancelar(reservaId).subscribe({
      next: () => {
        this.notifications.show('Reserva cancelada correctamente');
        this.load();
      },
      error: (error) => this.notifications.error(error?.error?.message || 'No se pudo cancelar la reserva')
    });
  }
}
