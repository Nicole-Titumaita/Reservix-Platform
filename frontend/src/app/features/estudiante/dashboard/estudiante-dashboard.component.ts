import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCalendarRange, LucideClock3, LucideHistory } from '@lucide/angular';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideArrowRight, LucideCalendarRange, LucideClock3, LucideHistory],
  templateUrl: './estudiante-dashboard.component.html',
  styleUrls: ['./estudiante-dashboard.component.scss']
})
export class EstudianteDashboardComponent {
  readonly role = localStorage.getItem('role') || 'ESTUDIANTE';

  readonly cards = [
    {
      title: 'Reservas propias',
      value: 'Panel personal',
      description: 'Consulta y gestiona tus solicitudes sin mezclarte con otros roles.'
    },
    {
      title: 'Disponibilidad',
      value: 'Horario libre',
      description: 'Revisa espacios y evita choques antes de crear una solicitud.'
    },
    {
      title: 'Historial',
      value: 'Seguimiento',
      description: 'Verifica estados anteriores y cambios de tus reservas.'
    }
  ];

  readonly links = [
    { label: 'Mis reservas', action: 'Ver solicitudes registradas', path: '/estudiante/reservas' },
    { label: 'Nueva reserva', action: 'Crear una solicitud nueva', path: '/estudiante/reservas/nueva' },
    { label: 'Disponibilidad', action: 'Buscar espacios libres', path: '/estudiante/disponibilidad' },
    { label: 'Mi historial', action: 'Revisar estados y movimientos', path: '/estudiante/historial' }
  ];

  readonly tips = [
    '1. Revisa primero la disponibilidad para evitar cruces de horario.',
    '2. Usa Nueva reserva solo cuando tengas claro el espacio y el motivo.',
    '3. Consulta tu historial para confirmar aprobaciones, rechazos o cancelaciones.'
  ];
}
