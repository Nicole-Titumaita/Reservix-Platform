import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { RolesService } from '../../../core/services/roles.service';
import { EstadosService } from '../../../core/services/estados.service';
import { Rol, Estado } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuarios-form.component.html',
  styleUrls: ['./usuarios-form.component.scss']
})
export class UsuariosFormComponent implements OnInit {
  roles: Rol[] = [];
  estados: Estado[] = [];
  loading = false;
  isEditMode = false;
  recordId?: number;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private estadosService: EstadosService,
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      rol_id: ['', Validators.required],
      estado_id: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      telefono: [''],
      codigo_institucional: ['']
    });
  }

  ngOnInit(): void {
    this.rolesService.getAll().subscribe((response) => (this.roles = response.data ?? []));
    this.estadosService.getAll().subscribe((response) => {
      this.estados = (response.data ?? []).filter((estado) => estado.categoria === 'USUARIO');
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isEditMode = true;
    this.recordId = id;
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.loading = true;
    this.usuariosService.getById(id).subscribe({
      next: (response) => {
        this.form.patchValue({
          ...response.data,
          password: ''
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo cargar el usuario');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.getRawValue() as any;
    const payload = {
      rol_id: Number(raw.rol_id),
      estado_id: Number(raw.estado_id),
      nombre: raw.nombre || '',
      apellido: raw.apellido || '',
      email: raw.email || '',
      telefono: raw.telefono || '',
      codigo_institucional: raw.codigo_institucional || '',
      ...(this.isEditMode ? {} : { password: raw.password || '' })
    };
    const request$ = this.isEditMode && this.recordId
      ? this.usuariosService.update(this.recordId, payload)
      : this.usuariosService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/usuarios']);
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo guardar el usuario');
      }
    });
  }
}

