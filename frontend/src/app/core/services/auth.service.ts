import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  AuthSession,
  ForgotPasswordRequest,
  InstitutionalCodeRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordTokenResponse,
  TwoFactorChallenge,
  Usuario,
  VerifyTwoFactorRequest
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<ApiResponse<TwoFactorChallenge>> {
    return this.http.post<ApiResponse<TwoFactorChallenge>>(`${this.baseUrl}/login`, payload);
  }

  adminLogin(payload: LoginRequest): Observable<ApiResponse<TwoFactorChallenge>> {
    return this.http.post<ApiResponse<TwoFactorChallenge>>(`${this.baseUrl}/admin-login`, payload);
  }

  verifyTwoFactor(payload: VerifyTwoFactorRequest): Observable<ApiResponse<AuthSession>> {
    return this.http.post<ApiResponse<AuthSession>>(`${this.baseUrl}/verify-2fa`, payload);
  }

  resendTwoFactor(userId: number): Observable<ApiResponse<TwoFactorChallenge>> {
    return this.http.post<ApiResponse<TwoFactorChallenge>>(`${this.baseUrl}/resend-2fa`, { user_id: userId });
  }

  register(payload: RegisterRequest): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${this.baseUrl}/register`, payload);
  }

  requestInstitutionalCode(payload: InstitutionalCodeRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/request-institutional-code`, payload);
  }

  verifyInstitutionalCode(payload: InstitutionalCodeRequest & { code: string }): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/verify-institutional-code`, payload);
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/forgot-password`, payload);
  }

  validateResetToken(token: string): Observable<ApiResponse<ResetPasswordTokenResponse>> {
    return this.http.get<ApiResponse<ResetPasswordTokenResponse>>(`${this.baseUrl}/reset-password/${encodeURIComponent(token)}`);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/reset-password`, payload);
  }

  me(): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(`${this.baseUrl}/me`);
  }

  logout(): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/logout`, {});
  }

  saveSession(session: AuthSession): void {
    localStorage.setItem('token', session.token);
    localStorage.setItem('role', session.usuario.rol_nombre || String(session.usuario.rol_id));
    localStorage.setItem('user', JSON.stringify(session.usuario));
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }

  getLandingPathForRole(role: string): string {
    switch (role) {
      case 'ADMINISTRADOR':
        return '/dashboard';
      case 'DOCENTE':
        return '/docente/dashboard';
      case 'ESTUDIANTE':
        return '/estudiante/dashboard';
      default:
        return '/dashboard';
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
