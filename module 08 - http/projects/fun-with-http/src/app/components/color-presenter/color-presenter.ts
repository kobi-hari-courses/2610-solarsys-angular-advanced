import { Component, computed, input } from '@angular/core';
import { Color } from '../../models/color.model';

@Component({
  imports: [],
  selector: 'app-color-presenter',
  styleUrl: './color-presenter.css',
  templateUrl: './color-presenter.html',
  host: {
    '[style.background-color]': 'rgb()'
  }
})
export class ColorPresenter {
  readonly color = input.required<Color>();

  readonly rgb = computed(() => `rgb(${this.color().r}, ${this.color().g}, ${this.color().b})`);

}
