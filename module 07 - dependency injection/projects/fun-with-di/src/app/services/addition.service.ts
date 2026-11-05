import { inject, Injectable } from "@angular/core";
import { HistoryService } from "./history.service";

@Injectable()
export class AdditionService {
    readonly id = Math.ceil(Math.random() * 100000);

    readonly historyService = inject(HistoryService);

    constructor() {
        console.log('Addition Service Created with id: ', this.id);
    }
    add(x: number, y: number) {
        const res = x + y;
        this.historyService.audit(`Addition Service add ${x}, ${y} with result ${res}`);
        return res;
    }
}