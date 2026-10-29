import { Component, computed, signal } from '@angular/core';
import { fakeQuestions } from './data/fake-questions';
import { correctAnswersCount } from './quiz.helpers';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  // core state
  readonly questions = signal(fakeQuestions);
  readonly answers = signal<number[]>([]);

  // derived state
  // --------------
  readonly currentQuestionIndex = computed(() => this.answers().length);
  readonly currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  readonly isQuizDone = computed(() => this.questions().length === this.answers().length);
  readonly correctAnswersCount = computed(() => correctAnswersCount(this.questions(), this.answers()));
  readonly score = computed(() => Math.round(this.correctAnswersCount() / this.questions().length * 100));

}
