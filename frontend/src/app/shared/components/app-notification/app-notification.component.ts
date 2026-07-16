import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-notification.component.html',
  styleUrls: ['./app-notification.component.scss']
})
export class AppNotificationComponent {
  constructor(public notifications: NotificationService) {}
}
