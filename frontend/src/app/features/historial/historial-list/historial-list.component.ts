import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistorialService } from '../../../core/services/historial.service';

@Component({
  selector: 'app-historial-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-list.component.html',
  styleUrls: ['./historial-list.component.scss']
})
export class HistorialListComponent implements OnInit {
  items: any[] = [];
  readonly role = localStorage.getItem('role') || '';

  constructor(private historialService: HistorialService) {}

  ngOnInit(): void {
    const request$ = this.isAdmin ? this.historialService.getAll() : this.historialService.getMine();
    request$.subscribe({
      next: (response) => (this.items = response.data ?? [])
    });
  }

  get isAdmin(): boolean {
    return this.role === 'ADMINISTRADOR';
  }
}
