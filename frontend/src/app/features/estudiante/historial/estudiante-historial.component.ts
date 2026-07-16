import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCalendarRange, LucideClock3, LucideHistory } from '@lucide/angular';
import { HistorialListComponent } from '../../historial/historial-list/historial-list.component';

@Component({
  selector: 'app-estudiante-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideCalendarRange, LucideClock3, LucideHistory, HistorialListComponent],
  templateUrl: './estudiante-historial.component.html',
  styleUrls: ['./estudiante-historial.component.scss']
})
export class EstudianteHistorialComponent {
  readonly role = localStorage.getItem('role') || 'ESTUDIANTE';
}
