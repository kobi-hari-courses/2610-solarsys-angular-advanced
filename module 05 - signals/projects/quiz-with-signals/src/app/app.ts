import { Component, computed, signal } from '@angular/core';
import { fakeQuestions } from './data/fake-questions';
import { buildReport, correctAnswersCount } from './quiz.helpers';
import { QuestionPresenter } from './components/question-presenter/question-presenter';
import { ProgressBar } from './components/progress-bar/progress-bar';
import { Summary } from './components/summary/summary';

@Component({
  imports: [QuestionPresenter, ProgressBar, Summary],
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
  readonly report = computed(() => buildReport(this.questions(), this.answers()));


  // action
  userAnswered(answer: number) {
    this.answers.update(all => [...all, answer]);
  }

  restartQuiz() {
    this.answers.set([]);
  }
}
