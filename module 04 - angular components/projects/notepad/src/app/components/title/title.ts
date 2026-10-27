import { Component, input } from "@angular/core";

@Component({
    selector: 'app-title', 
    templateUrl: './title.html',
    styleUrl: './title.css', 
    host: {
        '[style.color]': 'color()'
    }
})
export class Title {
    readonly caption = input.required<string>();

    readonly color = input('black');


}