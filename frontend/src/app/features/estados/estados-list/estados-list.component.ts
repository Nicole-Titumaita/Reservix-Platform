import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EstadosService } from '../../../core/services/estados.service';
import { Estado } from '../../../core/models';

@Component({
  selector: 'app-estados-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estados-list.component.html',
  styleUrls: ['./estados-list.component.scss']
})
export class EstadosListComponent implements OnInit {
  items: Estado[] = [];

  constructor(private estadosService: EstadosService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.estadosService.getAll().subscribe({
      next: (response) => (this.items = response.data ?? [])
    });
  }

  edit(id: number): void {
    this.router.navigate(['/estados/editar', id]);
  }

  remove(id: number): void {
    if (!confirm('Eliminar este estado?')) return;
    this.estadosService.delete(id).subscribe({ next: () => this.load() });
  }
}
