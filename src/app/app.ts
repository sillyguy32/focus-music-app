import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FocusSessionComponent } from './pages/focus-session/focus-session.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FocusSessionComponent, DashboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('focus-music-tracker');
}
