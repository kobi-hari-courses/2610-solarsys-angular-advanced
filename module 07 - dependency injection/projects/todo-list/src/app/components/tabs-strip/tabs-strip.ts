import { Component, input, model } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-tabs-strip',
  styleUrl: './tabs-strip.css',
  templateUrl: './tabs-strip.html',
})
export class TabsStrip {
  readonly tabs = input.required<string[]>();
  readonly selected = model.required<string>();

}
