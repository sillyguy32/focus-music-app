import { Component, ViewChild, ElementRef, AfterViewInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { Session } from '../../models/session.model';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit, DoCheck {

  @ViewChild('focusChart') chartRef!: ElementRef;

  chart: Chart | null = null;
  private lastSessionCount = 0;

  constructor(private sessionService: SessionService) {}

  ngDoCheck(): void {
    const count = this.sessionService.getSessions().length;
    if (count !== this.lastSessionCount) {
      this.lastSessionCount = count;
      setTimeout(() => this.createChart(), 0);
    }
  }

  get sessions(): Session[] {
    return this.sessionService
      .getSessions()
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  //  statiztikz
  get totalSessions(): number {
    return this.sessions.length;
  }

  get totalFocusTime(): number {
    return this.sessions.reduce((sum, s) => sum + s.duration, 0);
  }

  get averageFocus(): number {
    if (this.sessions.length === 0) return 0;

    const total = this.sessions.reduce((sum, s) => sum + s.focusRating, 0);
    return total / this.sessions.length;
  }

  get todaySessions(): Session[] {
    const today = new Date().toDateString();
    return this.sessions.filter(s =>
      new Date(s.startTime).toDateString() === today
    );
  }

  get todayFocusTime(): number {
    return this.todaySessions.reduce((sum, s) => sum + s.duration, 0);
  }

  get todaySessionsCount(): number {
    return this.todaySessions.length;
  }

  //  focus display
  getFocusLabel(rating: number): string {
    if (rating >= 5) return 'Excellent!';
    if (rating >= 4) return 'Good!';
    if (rating >= 3) return 'Decent!';
    if (rating >= 2) return 'Distracted!';
    return 'Very Distracted!';
  }

  getFocusClass(rating: number): string {
    if (rating >= 5) return 'excellent';
    if (rating >= 4) return 'good';
    if (rating >= 3) return 'decent';
    if (rating >= 2) return 'distracted';
    return 'very-distracted';
  }

  //  moosik analytikz
  get uniqueMusicType(): string[] {
    const musicSet = new Set(
      this.sessions.map(s => s.musicPlayed || 'None')
    );
    return Array.from(musicSet);
  }

  getAverageFocusByMusicType(music: string): number {
    const filtered = this.sessions.filter(s => s.musicPlayed === music);
    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, s) => sum + s.focusRating, 0);
    return total / filtered.length;
  }

  get bestMusicType(): string {
    if (this.uniqueMusicType.length === 0) return 'None';

    let best = this.uniqueMusicType[0];
    let bestRating = this.getAverageFocusByMusicType(best);

    for (const music of this.uniqueMusicType) {
      const score = this.getAverageFocusByMusicType(music);
      if (score > bestRating) {
        best = music;
        bestRating = score;
      }
    }

    return best;
  }

  get mostUsedMusicType(): string {
    if (this.sessions.length === 0) return 'None';

    const counts: { [key: string]: number } = {};

    for (const s of this.sessions) {
      const music = s.musicPlayed || 'None';
      counts[music] = (counts[music] || 0) + 1;
    }

    let mostUsed = this.uniqueMusicType[0];
    let maxCount = counts[mostUsed];

    for (const music in counts) {
      if (counts[music] > maxCount) {
        mostUsed = music;
        maxCount = counts[music];
      }
    }

    return mostUsed;
  }

  get worstMusicType(): string {
    if (this.uniqueMusicType.length === 0) return 'None';

    let worst = this.uniqueMusicType[0];
    let worstScore = this.getAverageFocusByMusicType(worst);

    for (const music of this.uniqueMusicType) {
      const score = this.getAverageFocusByMusicType(music);
      if (score < worstScore) {
        worst = music;
        worstScore = score;
      }
    }

    return worst;
  }

  // THE chart
  createChart(): void {

    const labels = this.uniqueMusicType;
    const data = labels.map(music => this.getAverageFocusByMusicType(music));

    if (labels.length === 0) return;

    const backgroundColors = data.map(value => {
      if (value >= 4) return 'rgba(75, 192, 192, 0.6)';
      if (value >= 3) return 'rgba(255, 206, 86, 0.6)';
      return 'rgba(255, 99, 132, 0.6)';
    });

    // destroy old chart
    if (this.chart) {
      this.chart.destroy();
    }

    // ✅ create chart
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Average Focus',
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 5
          }
        }
      }
    });
  }

  // 🧠 lifecycle
  ngAfterViewInit(): void {
    setTimeout(() => this.createChart(), 300);
  }
}