import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminLoginComponent } from './features/auth/admin-login/admin-login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsuariosListComponent } from './features/usuarios/usuarios-list/usuarios-list.component';
import { UsuariosFormComponent } from './features/usuarios/usuarios-form/usuarios-form.component';
import { RolesListComponent } from './features/roles/roles-list/roles-list.component';
import { RolesFormComponent } from './features/roles/roles-form/roles-form.component';
import { EspaciosListComponent } from './features/espacios/espacios-list/espacios-list.component';
import { EspaciosFormComponent } from './features/espacios/espacios-form/espacios-form.component';
import { RecursosListComponent } from './features/recursos/recursos-list/recursos-list.component';
import { RecursosFormComponent } from './features/recursos/recursos-form/recursos-form.component';
import { HorariosListComponent } from './features/horarios/horarios-list/horarios-list.component';
import { HorariosFormComponent } from './features/horarios/horarios-form/horarios-form.component';
import { EstadosListComponent } from './features/estados/estados-list/estados-list.component';
import { ReservasListComponent } from './features/reservas/reservas-list/reservas-list.component';
import { ReservasFormComponent } from './features/reservas/reservas-form/reservas-form.component';
import { ReservasDisponibilidadComponent } from './features/reservas/reservas-disponibilidad/reservas-disponibilidad.component';
import { HistorialListComponent } from './features/historial/historial-list/historial-list.component';
import { EstadosFormComponent } from './features/estados/estados-form/estados-form.component';

export const appRoutes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'admin-login', component: AdminLoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'usuarios', component: UsuariosListComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'usuarios/nuevo', component: UsuariosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'usuarios/editar/:id', component: UsuariosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'roles', component: RolesListComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'roles/nuevo', component: RolesFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'roles/editar/:id', component: RolesFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'espacios', component: EspaciosListComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'espacios/nuevo', component: EspaciosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'espacios/editar/:id', component: EspaciosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'recursos', component: RecursosListComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'recursos/nuevo', component: RecursosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'recursos/editar/:id', component: RecursosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'horarios', component: HorariosListComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'horarios/nuevo', component: HorariosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'horarios/editar/:id', component: HorariosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'estados', component: EstadosListComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'estados/nuevo', component: EstadosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'estados/editar/:id', component: EstadosFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'reservas', component: ReservasListComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'reservas/nueva', component: ReservasFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'reservas/editar/:id', component: ReservasFormComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: 'reservas/disponibilidad', component: ReservasDisponibilidadComponent },
      { path: 'mis-reservas', component: ReservasListComponent, canActivate: [roleGuard], data: { roles: ['DOCENTE', 'ESTUDIANTE'] } },
      { path: 'mis-reservas/nueva', component: ReservasFormComponent, canActivate: [roleGuard], data: { roles: ['DOCENTE', 'ESTUDIANTE'] } },
      { path: 'mis-reservas/editar/:id', component: ReservasFormComponent, canActivate: [roleGuard], data: { roles: ['DOCENTE', 'ESTUDIANTE'] } },
      { path: 'mi-historial', component: HistorialListComponent, canActivate: [roleGuard], data: { roles: ['DOCENTE', 'ESTUDIANTE'] } },
      { path: 'historial', component: HistorialListComponent, canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
