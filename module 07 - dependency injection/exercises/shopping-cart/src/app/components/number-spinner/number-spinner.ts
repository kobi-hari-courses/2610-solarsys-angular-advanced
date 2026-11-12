import { Component, input, model, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-number-spinner',
  styleUrl: './number-spinner.css',
  templateUrl: './number-spinner.html',
})
export class NumberSpinner {
  readonly value = input(0);
  readonly increment = output();
  readonly decrement = output();

}
