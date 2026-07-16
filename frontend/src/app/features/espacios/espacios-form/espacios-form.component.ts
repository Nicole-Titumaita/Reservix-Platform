import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EspaciosService } from '../../../core/services/espacios.service';
import { EstadosService } from '../../../core/services/estados.service';
import { Estado } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-espacios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './espacios-form.component.html',
  styleUrls: ['./espacios-form.component.scss']
})
export class EspaciosFormComponent implements OnInit {
  estados: Estado[] = [];
  loading = false;
  isEditMode = false;
  recordId?: number;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private espaciosService: EspaciosService,
    private estadosService: EstadosService,
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      estado_id: ['', Validators.required],
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      ubicacion: [''],
      capacidad: [0],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.estadosService.getAll().subscribe((response) => {
      this.estados = (response.data ?? []).filter((estado) => estado.categoria === 'ESPACIO');
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isEditMode = true;
    this.recordId = id;
    this.loading = true;
    this.espaciosService.getById(id).subscribe({
      next: (response) => {
        this.form.patchValue(response.data ?? {});
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo cargar el espacio');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.getRawValue() as any;
    const payload = {
      estado_id: Number(raw.estado_id),
      codigo: raw.codigo || '',
      nombre: raw.nombre || '',
      tipo: raw.tipo || '',
      ubicacion: raw.ubicacion || '',
      capacidad: Number(raw.capacidad ?? 0),
      descripcion: raw.descripcion || ''
    };
    const request$ = this.isEditMode && this.recordId
      ? this.espaciosService.update(this.recordId, payload)
      : this.espaciosService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/espacios']);
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo guardar el espacio');
      }
    });
  }
}

