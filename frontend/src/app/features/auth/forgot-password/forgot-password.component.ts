import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  readonly emailPattern = /^[a-z0-9._%+-]+@(([a-z0-9-]+\.)+[a-z]{2,}|demo\.local)$/i;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]]
    });
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const email = this.form.getRawValue().email?.trim().toLowerCase() || '';

    this.auth.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message || 'Si el correo pertenece a una cuenta registrada, recibirás un enlace para restablecer tu contraseña.';
        this.notifications.show(this.successMessage, 'Solicitud enviada');
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'No fue posible procesar la solicitud';
        this.notifications.error(this.errorMessage);
      }
    });
  }

  hasError(): boolean {
    const control = this.form.get('email');
    return !!control && control.invalid && (control.dirty || control.touched || this.submitted);
  }
}
