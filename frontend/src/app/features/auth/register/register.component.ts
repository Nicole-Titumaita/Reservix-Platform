import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  readonly emailPattern = /^[a-z0-9._%+-]+@(([a-z0-9-]+\.)+[a-z]{2,}|demo\.local)$/i;
  readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  readonly safeNamePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s'-]{2,80}$/;
  readonly institutionalCodePattern = /^[A-Z0-9_-]{6,30}$/;
  roles = [
    { id: 3, nombre: 'ESTUDIANTE' },
    { id: 2, nombre: 'DOCENTE' }
  ];
  loading = false;
  requestingCode = false;
  generalError = '';
  codeMessage = '';
  passwordFocused = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private notifications: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(this.safeNamePattern)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(this.safeNamePattern)]],
      cedula: ['', [Validators.required, this.ecuadorCedulaValidator]],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
      confirm_password: ['', Validators.required],
      telefono: [''],
      codigo_institucional: ['', [Validators.required, Validators.pattern(this.institutionalCodePattern)]],
      rol_id: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit(): void {
    this.form.patchValue({ rol_id: '3' });
  }

  submit(): void {
    this.generalError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const raw = this.form.getRawValue() as any;
    const payload = {
      nombre: (raw.nombre || '').trim(),
      apellido: (raw.apellido || '').trim(),
      cedula: (raw.cedula || '').trim(),
      email: (raw.email || '').trim().toLowerCase(),
      password: raw.password || '',
      confirm_password: raw.confirm_password || '',
      telefono: (raw.telefono || '').trim(),
      codigo_institucional: (raw.codigo_institucional || '').trim().toUpperCase(),
      rol_id: raw.rol_id ? Number(raw.rol_id) : undefined
    };
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.loading = false;
        this.generalError = error?.error?.message || 'No se pudo registrar la cuenta';
        this.notifications.error(this.generalError);
      }
    });
  }

  requestInstitutionalCode(): void {
    this.codeMessage = '';
    this.generalError = '';
    const emailControl = this.form.get('email');
    const roleControl = this.form.get('rol_id');
    if (!emailControl || !roleControl || emailControl.invalid || roleControl.invalid) {
      emailControl?.markAsTouched();
      roleControl?.markAsTouched();
      this.generalError = 'Primero valida el correo y el tipo de usuario.';
      return;
    }

    this.requestingCode = true;
    const email = String(emailControl.value || '').trim().toLowerCase();
    const rol_id = Number(roleControl.value);

    this.auth.requestInstitutionalCode({ email, rol_id }).subscribe({
      next: (response) => {
        this.requestingCode = false;
        this.codeMessage = response.message || 'Codigo enviado al correo';
        this.notifications.show(this.codeMessage, 'Codigo institucional');
      },
      error: (error) => {
        this.requestingCode = false;
        this.generalError = error?.error?.message || 'No se pudo enviar el codigo institucional';
        this.notifications.error(this.generalError);
      }
    });
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  passwordValue(): string {
    return this.form.get('password')?.value || '';
  }

  passwordRule(rule: 'length' | 'upper' | 'lower' | 'number' | 'special'): boolean {
    const value = this.passwordValue();
    const rules = {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[^A-Za-z0-9]/.test(value)
    };
    return rules[rule];
  }

  showPasswordRules(): boolean {
    const control = this.form.get('password');
    return this.passwordFocused || (!!control && control.invalid && control.touched);
  }

  fieldMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio.';
    if (control.errors['pattern']) {
      const messages: Record<string, string> = {
        nombre: 'Usa solo letras, espacios, apostrofe o guion. Minimo 2 caracteres.',
        apellido: 'Usa solo letras, espacios, apostrofe o guion. Minimo 2 caracteres.',
        email: 'Ingresa un correo valido. Tambien se permite demo.local para pruebas.',
        password: 'La contrasena debe cumplir todas las reglas de seguridad.',
        codigo_institucional: 'Usa 6 a 30 caracteres: letras, numeros, guion medio o guion bajo.'
      };
      return messages[controlName] || 'Formato invalido.';
    }
    if (control.errors['cedulaEcuador']) return 'La cedula ingresada no es valida.';
    if (control.errors['maxlength']) return 'El valor supera la longitud permitida.';
    if (control.errors['minlength']) return 'El valor es demasiado corto.';
    return 'Revisa este campo.';
  }

  confirmPasswordError(): boolean {
    const confirm = this.form.get('confirm_password');
    return !!confirm && (confirm.dirty || confirm.touched) && (confirm.invalid || this.form.hasError('passwordMismatch'));
  }

  confirmPasswordMessage(): string {
    const confirm = this.form.get('confirm_password');
    if (confirm?.errors?.['required']) return 'Este campo es obligatorio.';
    if (this.form.hasError('passwordMismatch')) return 'Las contrasenas no coinciden.';
    return '';
  }

  ecuadorCedulaValidator(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value || '').trim();
    if (!value) return null;
    if (!/^\d{10}$/.test(value)) return { cedulaEcuador: true };

    const provincia = Number(value.slice(0, 2));
    const third = Number(value[2]);
    if (!((provincia >= 1 && provincia <= 24) || provincia === 30) || third >= 6) {
      return { cedulaEcuador: true };
    }

    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const total = coefficients.reduce((sum, coefficient, index) => {
      let product = Number(value[index]) * coefficient;
      if (product >= 10) product -= 9;
      return sum + product;
    }, 0);
    const digit = total % 10 === 0 ? 0 : 10 - (total % 10);
    return digit === Number(value[9]) ? null : { cedulaEcuador: true };
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value || '';
    const confirm = group.get('confirm_password')?.value || '';
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  }
}
