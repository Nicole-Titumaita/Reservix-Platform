import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNotificationComponent } from './shared/components/app-notification/app-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppNotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
