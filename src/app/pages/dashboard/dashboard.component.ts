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


    constructor(private sessionService: SessionService) {}
    get sessions(): Session[] {
        return this.sessionService
         .getSessions()
         .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }

    get totalSessions(): number {
        return this.sessions.length;
    }

    get totalFocusTime(): number { // s = session
        return this.sessions.reduce((sum, s) => sum + s.duration, 0);
    }

    get averageFocus(): number {
        if (this.sessions.length === 0) {
            return 0;
        }

        const totalRating = this.sessions.reduce((sum, s) => sum + s.focusRating, 0);
        return totalRating / this.sessions.length;
    
    
    }

    get todaySessions(): Session[] {
        const today = new Date().toDateString();

        return this.sessions.filter(s => // again, s = session
            new Date(s.startTime).toDateString() === today);
    }

    get todayFocusTime(): number {
        return this.todaySessions.reduce((sum, s) => sum + s.duration, 0);
    }
    
    get todaySessionsCount(): number { 
        return this.todaySessions.length;
    }

    getFocusLabel(rating: number): string { 
        if (rating >= 5) return 'Excellent!';
        if (rating >= 4) return 'Good!';
        if (rating >= 3) return 'Decent!';
        if (rating >= 2) return 'Distracted!';
        return 'Very Distracted!';
    }

    getFocusClass(rating: number): string { // color coding for focus rating
        if (rating >= 5) return 'excellent';
        if (rating >= 4) return 'good';
        if (rating >= 3) return 'decent';
        if (rating >= 2) return 'distracted';
        return 'very-distracted';
    }

    getAverageFocusByMusicType(music: string): number { // to calculate average focus rating for a specific music type
        const filtered = this.sessions.filter(s => s.musicPlayed === music);
        if (filtered.length === 0) return 0;

        const total = filtered.reduce((sum, s) => sum + s.focusRating, 0); // sum of focus ratings for the filtered sessions
        return total / filtered.length;

    }


    get uniqueMusicType(): string[] { // to get unique music types for dashboard display
        const musicSet = new Set(
        this.sessions.map(s => s.musicPlayed || 'None') );

        return Array.from(musicSet);

    }

    get bestMusicType(): string { // to determine which music type has the highest average focus rating
        if (this.uniqueMusicType.length === 0) return 'None';

        let best = this.uniqueMusicType[0];
        let bestRating = this.getAverageFocusByMusicType(best);

        for (const music of this.uniqueMusicType) { // loop through each unique music type
            const score = this.getAverageFocusByMusicType(music);
            if (score > bestRating) {
                best = music;
                bestRating = score;
            }
        }

        return best;
    }

}
