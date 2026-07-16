import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly title = signal('Mensaje del sistema');
  readonly message = signal('');

  show(message: string, title = 'Mensaje del sistema'): void {
    this.title.set(title);
    this.message.set(message);
  }

  error(message: string): void {
    this.show(message, 'No pudimos completar la accion');
  }

  clear(): void {
    this.message.set('');
  }
}
