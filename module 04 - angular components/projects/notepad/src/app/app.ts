import { Component, signal } from '@angular/core';
import { Title } from './components/title/title' 

@Component({
  imports: [Title],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  // state
  readonly possibleColors = signal(['red', 'green', 'blue', 'yellow', 'orange', 'black', 'brown']);

  readonly possibleFonts = signal([
    'Arial',
    'Verdana',
    'Times New Roman',
    'Courier New',
    'Georgia',
  ]);

  readonly possibleSizes = signal(['14px', '16px', '18px', '20px', '24px', '36px', '48px']);

  readonly selectedColor = signal(this.possibleColors()[0]);
  readonly selectedFont = signal(this.possibleFonts()[0]);
  readonly selectedSize = signal(this.possibleSizes()[0]);

  // actions
  selectColor(value: string) {
    this.selectedColor.set(value);
  }

  selectFont(value: string) {
    this.selectedFont.set(value);
  }

  selectSize(value: string) {
    this.selectedSize.set(value);
  }
}
