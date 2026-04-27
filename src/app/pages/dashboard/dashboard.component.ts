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
  @ViewChild('trendChart') trendChartRef!: ElementRef;

  chart: Chart | null = null;
  trendChart: Chart | null = null;
  private lastSessionCount = 0;

  constructor(private sessionService: SessionService) {}

  ngDoCheck(): void {
    const count = this.sessionService.getSessions().length;
    if (count !== this.lastSessionCount) {
      this.lastSessionCount = count;
      setTimeout(() => { this.createChart(); this.createTrendChart(); }, 0);
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

  get trendInfo(): { direction: 'improving' | 'declining' | 'stable' | 'insufficient'; change: number; sessionCount: number; message: string } {
    const all = this.sessionService.getSessions()
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    if (all.length < 4) {
      const needed = 4 - all.length;
      return { direction: 'insufficient', change: 0, sessionCount: all.length, message: `Complete ${needed} more session${needed === 1 ? '' : 's'} to see your focus trend.` };
    }

    const recent = all.slice(-10);
    const mid = Math.floor(recent.length / 2);
    const firstAvg = recent.slice(0, mid).reduce((s, x) => s + x.focusRating, 0) / mid;
    const secondAvg = recent.slice(mid).reduce((s, x) => s + x.focusRating, 0) / (recent.length - mid);
    const change = secondAvg - firstAvg;
    const count = recent.length;

    if (change > 0.3) return { direction: 'improving', change, sessionCount: count, message: `Hell yeah! Your focus has been improving over your recent sessions, keep it up!` };
    if (change < -0.3) return { direction: 'declining', change, sessionCount: count, message: `Your focus has been declining over your last few sessions, try switching things up!` };
    return { direction: 'stable', change, sessionCount: count, message: `Your focus has been consistent across your recent sessions, nice!` };
  }

  get chronologicalSessions(): Session[] {
    return this.sessionService.getSessions()
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(-15);
  }

  createTrendChart(): void {
    if (!this.trendChartRef) return;

    const sessions = this.chronologicalSessions;
    if (sessions.length < 2) return;

    const labels = sessions.map(s => new Date(s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' }));
    const ratings = sessions.map(s => s.focusRating);

    if (this.trendChart) this.trendChart.destroy();

    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(124, 106, 255, 0.35)');
    gradient.addColorStop(1, 'rgba(124, 106, 255, 0)');

    this.trendChart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Focus Rating',
          data: ratings,
          borderColor: '#7c6aff',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#7c6aff',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 0, max: 5,
            ticks: { stepSize: 1, color: '#6b7494' },
            grid: { color: 'rgba(37, 42, 69, 0.8)' }
          },
          x: {
            ticks: { color: '#6b7494', maxTicksLimit: 8 },
            grid: { display: false }
          }
        }
      }
    });
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

  ngAfterViewInit(): void {
    setTimeout(() => { this.createChart(); this.createTrendChart(); }, 300);
  }
}