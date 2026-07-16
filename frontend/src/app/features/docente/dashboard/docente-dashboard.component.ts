import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCalendarRange, LucideClock3, LucideHistory } from '@lucide/angular';
import { DocenteDashboardData } from '../../../core/models';
import { DocenteService } from '../../../core/services/docente.service';
import { NotificationService } from '../../../core/services/notification.service';

type DocenteCardIcon = 'reservas' | 'disponibilidad' | 'historial';

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideArrowRight, LucideCalendarRange, LucideClock3, LucideHistory],
  templateUrl: './docente-dashboard.component.html',
  styleUrls: ['./docente-dashboard.component.scss']
})
export class DocenteDashboardComponent implements OnInit {
  readonly role = localStorage.getItem('role') || 'DOCENTE';
  loading = true;
  dashboard: DocenteDashboardData | null = null;
  generalError = '';

  readonly steps = [
    '1. Revisa disponibilidad antes de solicitar un espacio.',
    '2. Crea tu reserva con el horario y motivo academico.',
    '3. Consulta el estado de la solicitud desde el panel de reservas del docente.',
    '4. Si cambian tus planes, cancela solo las reservas pendientes.'
  ];

  readonly quickLinks = [
    { label: 'Crear reserva', action: 'Solicitar un espacio ahora', path: '/docente/reservas/nueva' },
    { label: 'Consultar reservas', action: 'Ver tus solicitudes actuales', path: '/docente/reservas' },
    { label: 'Ver disponibilidad', action: 'Evitar choques de horario', path: '/docente/disponibilidad' },
    { label: 'Abrir historial', action: 'Revisar estados anteriores', path: '/docente/historial' }
  ];

  readonly cards = [
    {
      title: 'Nueva reserva',
      description: 'Agrega una solicitud para clases, tutorias o evaluaciones.',
      path: '/docente/reservas/nueva',
      icon: 'reservas' as DocenteCardIcon
    },
    {
      title: 'Mis reservas',
      description: 'Revisa tus solicitudes, estados y cancelaciones pendientes.',
      path: '/docente/reservas',
      icon: 'reservas' as DocenteCardIcon
    },
    {
      title: 'Disponibilidad',
      description: 'Consulta espacios y horarios libres antes de reservar.',
      path: '/docente/disponibilidad',
      icon: 'disponibilidad' as DocenteCardIcon
    },
    {
      title: 'Mi historial',
      description: 'Sigue el estado de tus reservas anteriores en un solo lugar.',
      path: '/docente/historial',
      icon: 'historial' as DocenteCardIcon
    }
  ];

  constructor(
    private docenteService: DocenteService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.docenteService.getDashboard().subscribe({
      next: (response) => {
        this.dashboard = response.data || null;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.generalError = 'No se pudo cargar el panel docente';
        this.notifications.error(this.generalError);
      }
    });
  }

  get displayName(): string {
    const raw = localStorage.getItem('user');
    if (!raw) return 'Docente';

    try {
      const user = JSON.parse(raw);
      return [user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'Docente';
    } catch {
      return 'Docente';
    }
  }

  get summary() {
    return this.dashboard?.resumen || {
      total_reservas: 0,
      pendientes: 0,
      aprobadas: 0,
      rechazadas: 0,
      canceladas: 0,
      proximas: 0
    };
  }
}
