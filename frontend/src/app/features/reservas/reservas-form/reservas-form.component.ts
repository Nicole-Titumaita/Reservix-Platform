import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservasService } from '../../../core/services/reservas.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { EspaciosService } from '../../../core/services/espacios.service';
import { HorariosService } from '../../../core/services/horarios.service';
import { EstadosService } from '../../../core/services/estados.service';
import { Usuario, Espacio, Horario, Estado, Reserva } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-reservas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reservas-form.component.html',
  styleUrls: ['./reservas-form.component.scss']
})
export class ReservasFormComponent implements OnInit {
  usuarios: Usuario[] = [];
  espacios: Espacio[] = [];
  horarios: Horario[] = [];
  estados: Estado[] = [];
  loading = false;
  errorMessage = '';
  isEditMode = false;
  recordId?: number;
  readonly role = localStorage.getItem('role') || '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reservasService: ReservasService,
    private usuariosService: UsuariosService,
    private espaciosService: EspaciosService,
    private horariosService: HorariosService,
    private estadosService: EstadosService,
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      usuario_id: ['', Validators.required],
      espacio_id: ['', Validators.required],
      horario_id: ['', Validators.required],
      estado_id: ['', Validators.required],
      fecha_reserva: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      motivo: ['', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.form.patchValue({ fecha_reserva: new Date().toISOString().slice(0, 10) });

    if (this.isAdmin) {
      this.usuariosService.getAll().subscribe((response) => (this.usuarios = response.data ?? []));
    }
    this.espaciosService.getAll().subscribe((response) => (this.espacios = response.data ?? []));
    this.horariosService.getAll().subscribe((response) => (this.horarios = response.data ?? []));
    this.estadosService.getAll().subscribe((response) => {
      this.estados = (response.data ?? []).filter((estado) => estado.categoria === 'RESERVA');
      this.setDefaultsForNormalUser();
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isEditMode = true;
    this.recordId = id;
    this.loading = true;
    this.reservasService.getById(id).subscribe({
      next: (response) => {
        this.patchReserva(response.data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo cargar la reserva');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const raw = this.form.getRawValue() as any;
    const payload = {
      usuario_id: Number(raw.usuario_id),
      espacio_id: Number(raw.espacio_id),
      horario_id: Number(raw.horario_id),
      estado_id: Number(raw.estado_id),
      fecha_reserva: raw.fecha_reserva || '',
      fecha_inicio: raw.fecha_inicio || '',
      fecha_fin: raw.fecha_fin || '',
      motivo: raw.motivo || '',
      observaciones: raw.observaciones || ''
    };

    if (!this.isEditMode) {
      this.reservasService.checkDisponibilidad({
        espacio_id: payload.espacio_id,
        fecha_inicio: payload.fecha_inicio,
        fecha_fin: payload.fecha_fin
      }).subscribe({
        next: (response) => {
          if (!response.data?.disponible) {
            this.loading = false;
            this.errorMessage = response.data?.mensaje || 'El espacio no esta disponible';
            return;
          }
          this.save(payload);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'No se pudo validar la disponibilidad';
        }
      });
      return;
    }

    this.save(payload);
  }

  private save(payload: Partial<Reserva>): void {
    const request$ = this.isEditMode && this.recordId
      ? this.reservasService.update(this.recordId, payload)
      : this.reservasService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([this.isAdmin ? '/reservas' : '/mis-reservas']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'No se pudo guardar la reserva';
      }
    });
  }

  get isAdmin(): boolean {
    return this.role === 'ADMINISTRADOR';
  }

  private patchReserva(reserva?: Reserva): void {
    if (!reserva) return;
    this.form.patchValue({
      ...reserva,
      fecha_reserva: this.toDateInput(reserva.fecha_reserva),
      fecha_inicio: this.toDateTimeInput(reserva.fecha_inicio),
      fecha_fin: this.toDateTimeInput(reserva.fecha_fin)
    });
  }

  private setDefaultsForNormalUser(): void {
    if (this.isAdmin || this.isEditMode) return;

    const user = this.getCurrentUser();
    const pendiente = this.estados.find((estado) => estado.nombre === 'PENDIENTE');
    this.form.patchValue({
      usuario_id: user?.id ?? '',
      estado_id: pendiente?.id ?? ''
    });
  }

  private getCurrentUser(): { id: number } | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private toDateInput(value?: string): string {
    return value ? value.slice(0, 10) : '';
  }

  private toDateTimeInput(value?: string): string {
    if (!value) return '';
    return value.replace(' ', 'T').slice(0, 16);
  }
}

