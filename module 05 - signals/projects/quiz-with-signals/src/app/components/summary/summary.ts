import { Component, input } from '@angular/core';
import { QuizReport } from '../../models/report.model';

@Component({
  imports: [],
  selector: 'app-summary',
  styleUrl: './summary.css',
  templateUrl: './summary.html',
})
export class Summary {
  readonly score = input.required<number>();
  readonly report = input.required<QuizReport>();
}
