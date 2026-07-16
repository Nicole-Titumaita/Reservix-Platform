import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  resending = false;
  generalError = '';
  otpStep = false;
  challengeUserId: number | null = null;
  deliveryChannel = '';
  readonly emailPattern = /^[a-z0-9._%+-]+@(([a-z0-9-]+\.)+[a-z]{2,}|demo\.local)$/i;
  form: FormGroup;
  otpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notifications: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  submit(): void {
    this.generalError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const raw = this.form.getRawValue() as { email: string; password: string };
    const payload = {
      email: raw.email.trim().toLowerCase(),
      password: raw.password
    };

    this.auth.login(payload).subscribe({
      next: (response) => {
        const challenge = response.data;
        this.challengeUserId = challenge?.user_id || null;
        this.deliveryChannel = challenge?.delivery_channel || '';
        this.otpStep = !!challenge?.requires_2fa;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.generalError = error?.error?.message || 'No se pudo iniciar sesion';
        this.notifications.error(this.generalError);
      }
    });
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  hasOtpError(): boolean {
    const control = this.otpForm.get('code');
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  verifyOtp(): void {
    this.generalError = '';
    if (this.otpForm.invalid || !this.challengeUserId) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.auth.verifyTwoFactor({
      user_id: this.challengeUserId,
      code: this.otpForm.get('code')?.value
    }).subscribe({
      next: (response) => {
        if (response.data) {
          this.auth.saveSession(response.data);
          this.router.navigate(['/dashboard']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.generalError = error?.error?.message || 'No se pudo verificar el codigo';
        this.notifications.error(this.generalError);
      }
    });
  }

  resendOtp(): void {
    if (!this.challengeUserId) return;
    this.resending = true;
    this.auth.resendTwoFactor(this.challengeUserId).subscribe({
      next: (response) => {
        this.deliveryChannel = response.data?.delivery_channel || this.deliveryChannel;
        this.resending = false;
      },
      error: (error) => {
        this.resending = false;
        this.generalError = error?.error?.message || 'No se pudo reenviar el codigo';
        this.notifications.error(this.generalError);
      }
    });
  }

  backToCredentials(): void {
    this.otpStep = false;
    this.challengeUserId = null;
    this.otpForm.reset();
  }
}
