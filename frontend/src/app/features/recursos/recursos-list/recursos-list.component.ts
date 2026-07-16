import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucidePlus, LucideSquarePen, LucideTrash2 } from '@lucide/angular';
import { Recurso } from '../../../core/models';
import { RecursosService } from '../../../core/services/recursos.service';

@Component({
  selector: 'app-recursos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideArrowLeft, LucidePlus, LucideSquarePen, LucideTrash2],
  templateUrl: './recursos-list.component.html',
  styleUrls: ['./recursos-list.component.scss']
})
export class RecursosListComponent implements OnInit {
  items: Recurso[] = [];

  constructor(private recursosService: RecursosService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.recursosService.getAll().subscribe({
      next: (response) => (this.items = response.data ?? [])
    });
  }

  edit(id: number): void {
    this.router.navigate(['/recursos/editar', id]);
  }

  remove(id: number): void {
    if (!confirm('Eliminar este recurso?')) return;
    this.recursosService.delete(id).subscribe({ next: () => this.load() });
  }
}
