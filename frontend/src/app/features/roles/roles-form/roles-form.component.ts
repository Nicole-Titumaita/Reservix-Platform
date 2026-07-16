import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RolesService } from '../../../core/services/roles.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './roles-form.component.html',
  styleUrls: ['./roles-form.component.scss']
})
export class RolesFormComponent implements OnInit {
  loading = false;
  isEditMode = false;
  recordId?: number;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.isEditMode = true;
    this.recordId = id;
    this.loading = true;
    this.rolesService.getById(id).subscribe({
      next: (response) => {
        this.form.patchValue(response.data ?? {});
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo cargar el rol');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = this.form.getRawValue() as any;
    const request$ = this.isEditMode && this.recordId
      ? this.rolesService.update(this.recordId, payload)
      : this.rolesService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/roles']);
      },
      error: () => {
        this.loading = false;
        this.notifications.error('No se pudo guardar el rol');
      }
    });
  }
}

