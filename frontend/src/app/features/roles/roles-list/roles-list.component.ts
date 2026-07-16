import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RolesService } from '../../../core/services/roles.service';
import { Rol } from '../../../core/models';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})
export class RolesListComponent implements OnInit {
  roles: Rol[] = [];

  constructor(private rolesService: RolesService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.rolesService.getAll().subscribe({
      next: (response) => (this.roles = response.data ?? [])
    });
  }

  edit(id: number): void {
    this.router.navigate(['/roles/editar', id]);
  }

  remove(id: number): void {
    if (!confirm('Eliminar este rol?')) return;
    this.rolesService.delete(id).subscribe({ next: () => this.load() });
  }
}
