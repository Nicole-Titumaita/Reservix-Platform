import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HorariosService } from '../../../core/services/horarios.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-horarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './horarios-form.component.html',
  styleUrls: ['./horarios-form.component.scss']
})
export class HorariosFormComponent implements OnInit {
  dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  loading = false;
  isEditMode = false;
  recordId?: number;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private horariosService: HorariosService,
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      dia_semana: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      hora_fin: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isEditMode = true;
    this.recordId = id;
    this.loading = true;
    this.horariosService.getById(id).subscribe({
      next: (response) => {
        this.form.patchValue(response.data ?? {});
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo cargar el horario');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = this.form.getRawValue() as any;
    const request$ = this.isEditMode && this.recordId
      ? this.horariosService.update(this.recordId, payload)
      : this.horariosService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/horarios']);
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo guardar el horario');
      }
    });
  }
}

