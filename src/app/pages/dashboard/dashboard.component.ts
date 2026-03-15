import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { Session } from '../../models/session.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

    sessions: Session[] = [];

    constructor(private sessionService: SessionService) {
        this.sessions = this.sessionService.getSessions();
    }

    get totalSessions(): number {
        return this.sessions.length;
    }

    get totalFocusTime(): number {
        return this.sessions.reduce((sum, s) => sum + s.duration, 0);
    }

    get averageFocus(): number {
        if (this.sessions.length === 0) {
            return 0;
        }

        const totalRating = this.sessions.reduce((sum, s) => sum + s.focusRating, 0);
        return totalRating / this.sessions.length;
    
    
    }

}