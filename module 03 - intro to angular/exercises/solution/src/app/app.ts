import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

type GamePhase = 'in-progress' | 'win' | 'loss';
type GuessResult = 'correct' | 'too-high' | 'too-low';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly phase = signal<GamePhase>('in-progress');
  readonly secret = signal(randomSecret());  
  readonly guessCount = signal(0);
  readonly lastGuess = signal<number | null>(null);
  readonly lastGuessResult = signal<GuessResult | null>(null);
  readonly maxGuesses = signal(7);
  readonly history = signal<string[]>([]);

  reset() {
    this.phase.set('in-progress');
    this.secret.set(randomSecret());
    this.guessCount.set(0);
    this.lastGuess.set(null);
    this.lastGuessResult.set(null);
    this.history.set([]);
  }

  nextGuess(guess: string) {
    const guessValue = Number(guess);
    if (!Number.isInteger(guessValue)) return;
    if (guessValue > 100) return;
    if (guessValue < 1) return;
    if (this.phase() !== 'in-progress') return;

    this.lastGuess.set(guessValue);
    this.lastGuessResult.set(guessResult(this.secret(), guessValue));
    this.history.set([...this.history(), `${this.lastGuess()} ${this.lastGuessResult()}`]);
    this.guessCount.set(this.guessCount() + 1);

    if (this.lastGuessResult() === 'correct') {
      this.phase.set('win');
    } else {
      if (this.guessCount() === this.maxGuesses()) {
        this.phase.set('loss');
      }
    }
  }



}

function randomSecret() {
  return Math.floor(Math.random() * 100) + 1;
}

function guessResult(secret: number, guess: number): GuessResult {
  if (secret > guess) return 'too-low';
  if (secret < guess) return 'too-high';
  return 'correct';
}
