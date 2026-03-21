import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { Session } from '../../models/session.model';

@Component({
  selector: 'app-focus-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focus-session.component.html',
  styleUrls: ['./focus-session.component.css']
})
export class FocusSessionComponent implements OnDestroy {

  constructor(private sessionService: SessionService) {}
  private timer: any = null;

  totalSeconds = 25*60; // 25 mins
  remainingSeconds = this.totalSeconds;

  isRunning = false;
  sessionCompleted = false;

  startTime: Date | null = null;
  endTime: Date | null = null;

  // survey state
  focusRating: number | null = null;
  surveySubmitted = false;

  start() {
    if (this.isRunning || this.sessionCompleted) return;

    this.isRunning = true;
    if (!this.startTime) this.startTime = new Date();

    this.timer = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 0) {
        this.finish();
      }
    }, 1000);
  }

  finish() {
    this.stopTimer();
    this.endTime = new Date();
    this.sessionCompleted = true;
  }

  reset() {
    this.stopTimer();
    this.remainingSeconds = this.totalSeconds;
    this.isRunning = false;
    this.sessionCompleted = false;
    this.startTime = null;
    this.endTime = null;

    // reset survey too
    this.focusRating = null;
    this.surveySubmitted = false;
  }

  setRating(rating: number) {
    this.focusRating = rating;
  }

  submitSurvey() {
    if (this.focusRating === null) return;

    this.surveySubmitted = true;

    const sessionResult: Session = {
      startTime: this.startTime!,
      endTime: this.endTime!,
      duration: this.totalSeconds - this.remainingSeconds,
      focusRating: this.focusRating,
      musicPlayed: 'TBD', // to be implemented in the future
      mode: 'pomodoro'
    };

    this.sessionService.addSession(sessionResult);
    console.log('Session result:', sessionResult);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  get minutes(): number {
    return Math.floor(this.remainingSeconds / 60);
  }

  get seconds(): string {
    return String(this.remainingSeconds % 60).padStart(2, '0');
  }
  
  stopEarly() {
    if (!this.isRunning) return;

    this.stopTimer();
    this.endTime = new Date();
    this.sessionCompleted = true;
  }

  // so timers keep running if u tab out
  ngOnDestroy(): void {
    this.stopTimer();
  }
}