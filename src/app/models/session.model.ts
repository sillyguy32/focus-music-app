export interface Session {
    startTime: Date;
    endTime: Date;
    duration: number;
    
    musicPlayed?: string; // optional rn, to be implemented in the future
    focusRating: number;
    mode: 'pomodoro' | 'stopwatch'; 
}