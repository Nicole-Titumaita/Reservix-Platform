import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendarRange, LucideHistory } from '@lucide/angular';
import { ReservasDisponibilidadComponent } from '../../reservas/reservas-disponibilidad/reservas-disponibilidad.component';

@Component({
  selector: 'app-docente-disponibilidad',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideCalendarRange, LucideHistory, ReservasDisponibilidadComponent],
  templateUrl: './docente-disponibilidad.component.html',
  styleUrls: ['./docente-disponibilidad.component.scss']
})
export class DocenteDisponibilidadComponent {
  readonly role = localStorage.getItem('role') || 'DOCENTE';
}
