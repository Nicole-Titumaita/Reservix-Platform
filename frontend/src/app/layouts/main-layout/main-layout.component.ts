import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideCalendarRange,
  LucideCircleDot,
  LucideClock3,
  LucideHistory,
  LucideHouse,
  LucideLandmark,
  LucideLayoutDashboard,
  LucideLaptopMinimal,
  LucideLogOut,
  LucidePlus,
  LucideShield,
  LucideUsers
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LucideCalendarRange,
    LucideCircleDot,
    LucideClock3,
    LucideHistory,
    LucideHouse,
    LucideLandmark,
    LucideLayoutDashboard,
    LucideLaptopMinimal,
    LucideLogOut,
    LucidePlus,
    LucideShield,
    LucideUsers
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  sidebarCollapsed = false;

  readonly menu = [
    { label: 'Dashboard', path: '/dashboard', icon: LucideLayoutDashboard },
    { label: 'Usuarios', path: '/usuarios', icon: LucideUsers },
    { label: 'Roles', path: '/roles', icon: LucideShield },
    { label: 'Espacios', path: '/espacios', icon: LucideLandmark },
    { label: 'Recursos', path: '/recursos', icon: LucideLaptopMinimal },
    { label: 'Seguimiento recursos', path: '/recursos/seguimiento', icon: LucideHistory },
    { label: 'Horarios', path: '/horarios', icon: LucideClock3 },
    { label: 'Estados', path: '/estados', icon: LucideCircleDot },
    { label: 'Reservas', path: '/reservas', icon: LucideCalendarRange },
    { label: 'Historial', path: '/historial', icon: LucideHistory }
  ];

  readonly docenteMenu = [
    { label: 'Panel docente', path: '/docente/dashboard', icon: LucideLayoutDashboard },
    { label: 'Nueva reserva', path: '/docente/reservas/nueva', icon: LucideCalendarRange },
    { label: 'Mis reservas', path: '/docente/reservas', icon: LucideCalendarRange },
    { label: 'Disponibilidad', path: '/docente/disponibilidad', icon: LucideClock3 },
    { label: 'Mi historial', path: '/docente/historial', icon: LucideHistory }
  ];

  readonly studentMenu = [
    { label: 'Panel estudiante', path: '/estudiante/dashboard', icon: LucideLayoutDashboard },
    { label: 'Mis reservas', path: '/estudiante/reservas', icon: LucideCalendarRange },
    { label: 'Nueva reserva', path: '/estudiante/reservas/nueva', icon: LucideCalendarRange },
    { label: 'Disponibilidad', path: '/estudiante/disponibilidad', icon: LucideClock3 },
    { label: 'Mi historial', path: '/estudiante/historial', icon: LucideHistory }
  ];

  readonly role = localStorage.getItem('role') || '';

  constructor(private auth: AuthService, private router: Router) {}

  get visibleMenu() {
    if (this.role === 'ADMINISTRADOR') return this.menu;
    if (this.role === 'DOCENTE') return this.docenteMenu;
    return this.studentMenu;
  }

  get isAdmin(): boolean {
    return this.role === 'ADMINISTRADOR';
  }

  get homePath(): string {
    return this.auth.getLandingPathForRole(this.role);
  }

  get reservaCreatePath(): string {
    if (this.isAdmin) return '/reservas/nueva';
    if (this.role === 'DOCENTE') return '/docente/reservas/nueva';
    return '/estudiante/reservas/nueva';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.auth.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
