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
    { label: 'Horarios', path: '/horarios', icon: LucideClock3 },
    { label: 'Estados', path: '/estados', icon: LucideCircleDot },
    { label: 'Reservas', path: '/reservas', icon: LucideCalendarRange },
    { label: 'Historial', path: '/historial', icon: LucideHistory }
  ];

  readonly publicMenu = [
    { label: 'Dashboard', path: '/dashboard', icon: LucideLayoutDashboard },
    { label: 'Mis reservas', path: '/mis-reservas', icon: LucideCalendarRange },
    { label: 'Disponibilidad', path: '/reservas/disponibilidad', icon: LucideClock3 },
    { label: 'Mi historial', path: '/mi-historial', icon: LucideHistory }
  ];

  readonly role = localStorage.getItem('role') || '';

  constructor(private auth: AuthService, private router: Router) {}

  get visibleMenu() {
    return this.role === 'ADMINISTRADOR' ? this.menu : this.publicMenu;
  }

  get isAdmin(): boolean {
    return this.role === 'ADMINISTRADOR';
  }

  get reservaCreatePath(): string {
    return this.isAdmin ? '/reservas/nueva' : '/mis-reservas/nueva';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.auth.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
