import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendarRange, LucideClock3 } from '@lucide/angular';
import { DocenteDashboardHistorial } from '../../../core/models';
import { DocenteService } from '../../../core/services/docente.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-docente-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideCalendarRange, LucideClock3],
  templateUrl: './docente-historial.component.html',
  styleUrls: ['./docente-historial.component.scss']
})
export class DocenteHistorialComponent implements OnInit {
  loading = true;
  historial: DocenteDashboardHistorial[] = [];

  constructor(
    private docenteService: DocenteService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.docenteService.getHistorial().subscribe({
      next: (response) => {
        this.historial = (response.data as DocenteDashboardHistorial[]) ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo cargar tu historial');
      }
    });
  }
}
