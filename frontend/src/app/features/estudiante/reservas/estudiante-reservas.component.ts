import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendarRange, LucideClock3, LucideHistory, LucidePlus } from '@lucide/angular';
import { ReservasListComponent } from '../../reservas/reservas-list/reservas-list.component';

@Component({
  selector: 'app-estudiante-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideCalendarRange, LucideClock3, LucideHistory, LucidePlus, ReservasListComponent],
  templateUrl: './estudiante-reservas.component.html',
  styleUrls: ['./estudiante-reservas.component.scss']
})
export class EstudianteReservasComponent {
  readonly role = localStorage.getItem('role') || 'ESTUDIANTE';
}
