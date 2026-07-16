import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideCalendarRange, LucideLandmark, LucideLaptopMinimal, LucideUsers } from '@lucide/angular';

type CardIcon = 'users' | 'reservas' | 'espacios' | 'recursos';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideArrowRight, LucideCalendarRange, LucideLandmark, LucideLaptopMinimal, LucideUsers],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly role = localStorage.getItem('role') || '';
  readonly cards = [
    { title: 'Usuarios', value: '3 perfiles', description: 'Administrador, docente y estudiante', icon: 'users' as CardIcon },
    { title: 'Reservas', value: 'Pendientes', description: 'Validación de choques y aprobación', icon: 'reservas' as CardIcon },
    { title: 'Espacios', value: 'Aulas y labs', description: 'Control centralizado de disponibilidad', icon: 'espacios' as CardIcon },
    { title: 'Recursos', value: 'Equipos', description: 'Proyectores, laptops y kits', icon: 'recursos' as CardIcon }
  ];

  readonly links = [
    { label: 'Gestión administrativa', action: 'Usuarios y roles', path: '/usuarios' },
    { label: 'Infraestructura', action: 'Espacios y recursos', path: '/espacios' },
    { label: 'Operación académica', action: 'Horarios y reservas', path: '/reservas' },
    { label: 'Control', action: 'Estados e historial', path: '/historial' }
  ];

  readonly publicLinks = [{ label: 'Operación académica', action: 'Horarios y reservas', path: '/reservas' }];

  readonly steps = [
    '1. Crear y validar usuarios con rol.',
    '2. Registrar espacios y recursos disponibles.',
    '3. Configurar horarios base.',
    '4. Crear reservas y revisar el historial.'
  ];

  get visibleLinks() {
    return this.role === 'ADMINISTRADOR' ? this.links : this.publicLinks;
  }
}
