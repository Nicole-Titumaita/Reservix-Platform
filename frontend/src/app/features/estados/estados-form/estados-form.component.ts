import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EstadosService } from '../../../core/services/estados.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-estados-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './estados-form.component.html',
  styleUrls: ['./estados-form.component.scss']
})
export class EstadosFormComponent implements OnInit {
  categorias = ['USUARIO', 'ESPACIO', 'RECURSO', 'RESERVA'];
  loading = false;
  isEditMode = false;
  recordId?: number;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private estadosService: EstadosService,
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      categoria: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isEditMode = true;
    this.recordId = id;
    this.loading = true;
    this.estadosService.getById(id).subscribe({
      next: (response) => {
        const estado = response.data;
        this.form.patchValue({
          ...estado,
          activo: estado?.activo !== 0
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo cargar el estado');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.getRawValue() as any;
    const payload = {
      categoria: raw.categoria || '',
      nombre: raw.nombre || '',
      descripcion: raw.descripcion || '',
      activo: raw.activo ? 1 : 0
    };
    const request$ = this.isEditMode && this.recordId
      ? this.estadosService.update(this.recordId, payload)
      : this.estadosService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/estados']);
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo guardar el estado');
      }
    });
  }
}

