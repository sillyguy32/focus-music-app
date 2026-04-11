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
    // for the next 3 functions, they go through the same 4 steps: 1- start with default value, 2- loop through data, 3- compare values,
    //  4- replace when better/worse, its called finding the min/max in a dataset or some shit 

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

    get mostUsedMusicType(): string { // to determine which music type was used most frequently
        if (this.sessions.length === 0) return 'None'; 

        const counts: { [key: string]: number } = {}; // to count instances of each music type

        for (const s of this.sessions) {
            const music = s.musicPlayed || 'None'; 
            counts[music] = (counts[music] || 0) + 1; // increment count for this music type
        }

        let mostUsed = this.uniqueMusicType[0]; // assume first music type is most used
        let maxCount = counts[mostUsed]; 

        for (const music in counts) { // loop through each music type in counts
            if (counts[music] > maxCount) {
                mostUsed = music;
                maxCount = counts[music];
            }
        }
    return mostUsed;
    }
    
    get worstMusicType(): string { // to determine which music type has the lowest average focus rating 
        if (this.uniqueMusicType.length === 0) return 'None';

        let worst = this.uniqueMusicType[0];
        let worstScore = this.getAverageFocusByMusicType(worst);

        for (const music of this.uniqueMusicType) { // loop through each unique music type
            const score = this.getAverageFocusByMusicType(music); 
            if (score < worstScore) {
                worst = music;
                worstScore = score;
            }
        }
    return worst; 
    }


}
