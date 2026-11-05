import { inject, Injectable } from "@angular/core";
import { HistoryService } from "./history.service";

@Injectable()
export class WrongAdditionService {
    readonly id = Math.ceil(Math.random() * 100000);

    readonly historyService = inject(HistoryService);

    constructor() {
        console.log('Wrong Addition Service Created with id: ', this.id);
    }
    add(x: number, y: number) {
        const res = x + y + 1;
        this.historyService.audit(`Wrong Addition Service add ${x}, ${y} with result ${res}`);
        return res;
    }
}