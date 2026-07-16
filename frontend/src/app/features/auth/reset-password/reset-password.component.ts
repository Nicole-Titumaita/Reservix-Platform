import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

const passwordStrengthPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl) => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirm_password')?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  loading = false;
  token = '';
  tokenValid = false;
  tokenError = '';
  submitted = false;
  successMessage = '';
  errorMessage = '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.pattern(passwordStrengthPattern)]],
        confirm_password: ['', [Validators.required]]
      },
      { validators: passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    this.token = token;

    if (!token) {
      this.tokenError = 'El enlace no es valido o ha expirado.';
      return;
    }

    this.auth.validateResetToken(token).subscribe({
      next: (response) => {
        this.tokenValid = !!response.data?.valid;
        if (!this.tokenValid) {
          this.tokenError = response.message || 'El enlace no es valido o ha expirado.';
        }
      },
      error: () => {
        this.tokenError = 'El enlace no es valido o ha expirado.';
      }
    });
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.tokenValid) {
      this.errorMessage = this.tokenError || 'El enlace no es valido o ha expirado.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const raw = this.form.getRawValue();
    this.auth.resetPassword({
      token: this.token,
      password: raw.password || '',
      confirm_password: raw.confirm_password || ''
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message || 'Contrasena actualizada correctamente.';
        this.notifications.show(this.successMessage, 'Contrasena actualizada');
        setTimeout(() => this.router.navigate(['/auth/login']), 1200);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'No fue posible actualizar la contrasena.';
        this.notifications.error(this.errorMessage);
      }
    });
  }

  strengthOk(rule: 'length' | 'upper' | 'lower' | 'number' | 'special'): boolean {
    const password = this.form.get('password')?.value || '';
    const rules = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z\d]/.test(password)
    };
    return rules[rule];
  }

  mismatchError(): boolean {
    return !!this.form.errors?.['mismatch'] && (this.form.get('confirm_password')?.dirty || this.form.get('confirm_password')?.touched || this.submitted);
  }
}
