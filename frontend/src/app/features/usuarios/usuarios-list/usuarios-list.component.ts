import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../core/models';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss']
})
export class UsuariosListComponent implements OnInit {
  users: Usuario[] = [];

  constructor(private usuariosService: UsuariosService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.usuariosService.getAll().subscribe({
      next: (response) => (this.users = response.data ?? [])
    });
  }

  edit(id: number): void {
    this.router.navigate(['/usuarios/editar', id]);
  }

  remove(id: number): void {
    if (!confirm('Eliminar este usuario?')) return;
    this.usuariosService.delete(id).subscribe({ next: () => this.load() });
  }
}
