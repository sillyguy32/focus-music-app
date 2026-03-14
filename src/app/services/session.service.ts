import { Injectable } from '@angular/core';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessions: Session[] = [];

  addSession(session: Session): void {
    this.sessions.push(session);
  }
  getSessions(): Session[] {
    return this.sessions;
  }
}