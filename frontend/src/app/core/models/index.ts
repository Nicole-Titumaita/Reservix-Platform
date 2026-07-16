export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol_id: number;
  rol_nombre?: string;
  estado_id: number;
}

export interface AuthSession {
  token: string;
  usuario: AuthUser;
}

export interface TwoFactorChallenge {
  requires_2fa: boolean;
  two_factor_token: string;
  user_id: number;
  expires_in_minutes: number;
  delivery_channel?: 'email' | 'console';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyTwoFactorRequest {
  user_id: number;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordTokenResponse {
  valid: boolean;
  user_id?: number;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirm_password: string;
}

export interface InstitutionalCodeRequest {
  email: string;
  rol_id: number;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  password: string;
  confirm_password: string;
  rol_id?: number;
  telefono?: string;
  codigo_institucional?: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface Estado {
  id: number;
  categoria: 'USUARIO' | 'ESPACIO' | 'RECURSO' | 'RESERVA';
  nombre: string;
  descripcion?: string | null;
  activo?: number;
}

export interface Usuario {
  id: number;
  rol_id: number;
  estado_id: number;
  nombre: string;
  apellido: string;
  cedula?: string | null;
  cedula_provincia?: string | null;
  email: string;
  telefono?: string | null;
  codigo_institucional?: string | null;
  rol_nombre?: string;
  estado_nombre?: string;
}

export interface Espacio {
  id: number;
  estado_id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  ubicacion?: string | null;
  capacidad?: number | null;
  descripcion?: string | null;
  estado_nombre?: string;
}

export interface Recurso {
  id: number;
  espacio_id?: number | null;
  estado_id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  marca?: string | null;
  modelo?: string | null;
  serial?: string | null;
  descripcion?: string | null;
  espacio_nombre?: string;
  estado_nombre?: string;
}

export interface RecursoMovimiento {
  id: number;
  recurso_id: number;
  usuario_id: number;
  rol_id: number;
  rol_nombre: string;
  estado_anterior_id?: number | null;
  estado_nuevo_id: number;
  accion: string;
  observacion?: string | null;
  fecha_accion: string;
  recurso_codigo?: string;
  recurso_nombre?: string;
  usuario_nombre?: string;
  usuario_apellido?: string;
  estado_anterior_nombre?: string | null;
  estado_nuevo_nombre?: string;
}

export interface Horario {
  id: number;
  nombre: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  activo?: number;
}

export interface Reserva {
  id: number;
  usuario_id: number;
  espacio_id: number;
  horario_id: number;
  estado_id: number;
  fecha_reserva: string;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  observaciones?: string | null;
  usuario_nombre?: string;
  usuario_apellido?: string;
  espacio_nombre?: string;
  horario_nombre?: string;
  estado_nombre?: string;
}

export interface DisponibilidadReserva {
  disponible: boolean;
  mensaje: string;
  espacio?: Espacio;
  conflicto?: Partial<Reserva> | null;
}
