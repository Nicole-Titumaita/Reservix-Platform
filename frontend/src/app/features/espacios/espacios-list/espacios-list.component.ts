import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EspaciosService } from '../../../core/services/espacios.service';
import { Espacio } from '../../../core/models';

@Component({
  selector: 'app-espacios-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './espacios-list.component.html',
  styleUrls: ['./espacios-list.component.scss']
})
export class EspaciosListComponent implements OnInit {
  items: Espacio[] = [];

  constructor(private espaciosService: EspaciosService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.espaciosService.getAll().subscribe({
      next: (response) => (this.items = response.data ?? [])
    });
  }

  edit(id: number): void {
    this.router.navigate(['/espacios/editar', id]);
  }

  remove(id: number): void {
    if (!confirm('Eliminar este espacio?')) return;
    this.espaciosService.delete(id).subscribe({ next: () => this.load() });
  }
}
