import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HorariosService } from '../../../core/services/horarios.service';
import { Horario } from '../../../core/models';

@Component({
  selector: 'app-horarios-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './horarios-list.component.html',
  styleUrls: ['./horarios-list.component.scss']
})
export class HorariosListComponent implements OnInit {
  items: Horario[] = [];

  constructor(private horariosService: HorariosService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.horariosService.getAll().subscribe({
      next: (response) => (this.items = response.data ?? [])
    });
  }

  edit(id: number): void {
    this.router.navigate(['/horarios/editar', id]);
  }

  remove(id: number): void {
    if (!confirm('Eliminar este horario?')) return;
    this.horariosService.delete(id).subscribe({ next: () => this.load() });
  }
}
