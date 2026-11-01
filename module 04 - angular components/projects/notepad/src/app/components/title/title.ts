import { Component, computed, input, output } from "@angular/core";
import { getContrastingGray } from "../../utils/colors";

@Component({
    selector: 'app-title', 
    templateUrl: './title.html',
    styleUrl: './title.css', 
    host: {
        '[style.color]': 'color()',         
        '[style.background]': 'background()', 
        '(click)': 'whenClicked()'
    }
})
export class Title {
    readonly caption = input.required<string>();

    readonly color = input('black');

    readonly upperCaption = computed(() => this.caption().toUpperCase());

    readonly background = computed(() => getContrastingGray(this.color()));

    readonly tripleClicked = output<number>();

    #clickCount = 0;
    #timeOfFirstClick = 0;


    whenClicked() {
        if (this.#clickCount === 0) {
            this.#timeOfFirstClick = Date.now();
        }

        this.#clickCount++;

        if (this.#clickCount === 3) {
            this.tripleClicked.emit(Date.now() - this.#timeOfFirstClick);
            this.#clickCount = 0;
        }       
    }



}