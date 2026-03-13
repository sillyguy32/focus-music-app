import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FocusSessionComponent } from './pages/focus-session/focus-session.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FocusSessionComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('focus-music-tracker');
}
