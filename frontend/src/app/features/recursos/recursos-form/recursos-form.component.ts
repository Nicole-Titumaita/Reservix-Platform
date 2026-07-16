import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { RecursosService } from '../../../core/services/recursos.service';
import { EspaciosService } from '../../../core/services/espacios.service';
import { EstadosService } from '../../../core/services/estados.service';
import { Espacio, Estado } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-recursos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideArrowLeft],
  templateUrl: './recursos-form.component.html',
  styleUrls: ['./recursos-form.component.scss']
})
export class RecursosFormComponent implements OnInit {
  espacios: Espacio[] = [];
  estados: Estado[] = [];
  loading = false;
  isEditMode = false;
  recordId?: number;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private recursosService: RecursosService,
    private espaciosService: EspaciosService,
    private estadosService: EstadosService,
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      espacio_id: [''],
      estado_id: ['', Validators.required],
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      marca: [''],
      modelo: [''],
      serial: [''],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.espaciosService.getAll().subscribe((response) => (this.espacios = response.data ?? []));
    this.estadosService.getAll().subscribe((response) => {
      this.estados = (response.data ?? []).filter((estado) => estado.categoria === 'RECURSO');
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isEditMode = true;
    this.recordId = id;
    this.loading = true;
    this.recursosService.getById(id).subscribe({
      next: (response) => {
        this.form.patchValue(response.data ?? {});
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo cargar el recurso');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const raw = this.form.getRawValue() as any;
    const payload = {
      espacio_id: raw.espacio_id ? Number(raw.espacio_id) : null,
      estado_id: Number(raw.estado_id),
      codigo: raw.codigo || '',
      nombre: raw.nombre || '',
      tipo: raw.tipo || '',
      marca: raw.marca || '',
      modelo: raw.modelo || '',
      serial: raw.serial || '',
      descripcion: raw.descripcion || ''
    };
    const request$ = this.isEditMode && this.recordId
      ? this.recursosService.update(this.recordId, payload)
      : this.recursosService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/recursos']);
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo guardar el recurso');
      }
    });
  }
}

