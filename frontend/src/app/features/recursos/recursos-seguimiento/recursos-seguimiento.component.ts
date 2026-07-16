import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { Estado, Recurso, RecursoMovimiento } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { RecursosService } from '../../../core/services/recursos.service';
import { EstadosService } from '../../../core/services/estados.service';

@Component({
  selector: 'app-recursos-seguimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideArrowLeft],
  templateUrl: './recursos-seguimiento.component.html',
  styleUrls: ['./recursos-seguimiento.component.scss']
})
export class RecursosSeguimientoComponent implements OnInit {
  recursos: Recurso[] = [];
  estados: Estado[] = [];
  movimientos: RecursoMovimiento[] = [];
  roles = ['ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE'];
  actions = ['ASIGNACION', 'ENTREGA', 'DEVOLUCION', 'REVISION', 'MANTENIMIENTO', 'BAJA', 'INCIDENCIA'];
  loading = false;
  form: FormGroup;
  filtroRecursoId: string = '';
  filtroRolNombre: string = '';
  filtroAccion: string = '';
  readonly sessionRole = localStorage.getItem('role') || 'ADMINISTRADOR';

  constructor(
    private fb: FormBuilder,
    private recursosService: RecursosService,
    private estadosService: EstadosService,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      recurso_id: ['', Validators.required],
      accion: ['', Validators.required],
      estado_nuevo_id: ['', Validators.required],
      observacion: ['']
    });
  }

  ngOnInit(): void {
    this.loadResources();
    this.loadEstados();
    this.loadMovements();
  }

  loadResources(): void {
    this.recursosService.getAll().subscribe({
      next: (response) => (this.recursos = response.data ?? []),
      error: () => this.notifications.error('No se pudieron cargar los recursos')
    });
  }

  loadEstados(): void {
    this.estadosService.getAll().subscribe({
      next: (response) => {
        this.estados = (response.data ?? []).filter((estado) => estado.categoria === 'RECURSO');
      },
      error: () => this.notifications.error('No se pudieron cargar los estados')
    });
  }

  loadMovements(): void {
    let request$;

    if (this.filtroRecursoId) {
      request$ = this.recursosService.getMovementsByResourceId(
        Number(this.filtroRecursoId),
        this.filtroRolNombre || undefined,
        this.filtroAccion || undefined
      );
    } else if (this.filtroRolNombre) {
      request$ = this.filtroAccion
        ? this.recursosService.getMovementsByRoleAndAction(this.filtroRolNombre, this.filtroAccion)
        : this.recursosService.getMovementsByRole(this.filtroRolNombre);
    } else if (this.filtroAccion) {
      request$ = this.recursosService.getMovementsByAction(this.filtroAccion);
    } else {
      request$ = this.recursosService.getMovements();
    }

    request$.subscribe({
      next: (response) => (this.movimientos = response.data ?? []),
      error: () => this.notifications.error('No se pudo cargar el seguimiento de recursos')
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const raw = this.form.getRawValue();
    const payload = {
      recurso_id: Number(raw.recurso_id),
      accion: raw.accion,
      estado_nuevo_id: Number(raw.estado_nuevo_id),
      observacion: raw.observacion || ''
    };

    this.recursosService.createMovement(payload).subscribe({
      next: () => {
        this.loading = false;
        this.form.reset();
        this.notifications.show('Movimiento de recurso registrado correctamente');
        this.loadMovements();
        this.loadResources();
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo registrar el movimiento');
      }
    });
  }

  onFilterChange(value: string): void {
    this.filtroRecursoId = value;
    this.loadMovements();
  }

  onRoleFilterChange(value: string): void {
    this.filtroRolNombre = value;
    this.loadMovements();
  }

  onActionFilterChange(value: string): void {
    this.filtroAccion = value;
    this.loadMovements();
  }

  clearFilters(): void {
    this.filtroRecursoId = '';
    this.filtroRolNombre = '';
    this.filtroAccion = '';
    this.loadMovements();
  }

  get totalMovements(): number {
    return this.movimientos.length;
  }

  get roleSummary(): Array<{ role: string; count: number }> {
    return this.roles.map((role) => ({
      role,
      count: this.movimientos.filter((movement) => movement.rol_nombre === role).length
    }));
  }
}
