import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendarRange, LucideClock3, LucideHistory } from '@lucide/angular';
import { ReservasDisponibilidadComponent } from '../../reservas/reservas-disponibilidad/reservas-disponibilidad.component';

@Component({
  selector: 'app-estudiante-disponibilidad',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideCalendarRange, LucideClock3, LucideHistory, ReservasDisponibilidadComponent],
  templateUrl: './estudiante-disponibilidad.component.html',
  styleUrls: ['./estudiante-disponibilidad.component.scss']
})
export class EstudianteDisponibilidadComponent {
  readonly role = localStorage.getItem('role') || 'ESTUDIANTE';
}
