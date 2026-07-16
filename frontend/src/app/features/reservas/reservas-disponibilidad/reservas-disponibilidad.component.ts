import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DisponibilidadReserva, Espacio } from '../../../core/models';
import { EspaciosService } from '../../../core/services/espacios.service';
import { ReservasService } from '../../../core/services/reservas.service';

@Component({
  selector: 'app-reservas-disponibilidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reservas-disponibilidad.component.html',
  styleUrls: ['./reservas-disponibilidad.component.scss']
})
export class ReservasDisponibilidadComponent implements OnInit {
  readonly role = localStorage.getItem('role') || '';
  espacios: Espacio[] = [];
  loading = false;
  result?: DisponibilidadReserva;
  errorMessage = '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private espaciosService: EspaciosService,
    private reservasService: ReservasService
  ) {
    this.form = this.fb.group({
      espacio_id: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.espaciosService.getAll().subscribe({
      next: (response) => (this.espacios = response.data ?? [])
    });
  }

  get backPath(): string {
    return this.role === 'ADMINISTRADOR' ? '/reservas' : '/mis-reservas';
  }

  consultar(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.result = undefined;
    this.errorMessage = '';
    const raw = this.form.getRawValue() as any;

    this.reservasService.checkDisponibilidad({
      espacio_id: Number(raw.espacio_id),
      fecha_inicio: raw.fecha_inicio,
      fecha_fin: raw.fecha_fin
    }).subscribe({
      next: (response) => {
        this.result = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'No se pudo consultar la disponibilidad';
        this.loading = false;
      }
    });
  }
}
