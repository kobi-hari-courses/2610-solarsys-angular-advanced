import { Component, inject, Injector, runInInjectionContext, signal } from '@angular/core';
import { AdditionService } from '../../services/addition.service';
import { WrongAdditionService } from '../../services/wrong-addition.service';

@Component({
  imports: [],
  selector: 'app-calc',
  styleUrl: './calc.css',
  templateUrl: './calc.html',
  providers: [
    
  ]
})
export class Calc {
  readonly x = signal(0);
  readonly y = signal(0);

  readonly result = signal(0);

  readonly additionService = inject(AdditionService);
  readonly wrongService = inject(WrongAdditionService);

  readonly injector = inject(Injector);

  constructor() {
  }

  async calc() {
    const x = await runInInjectionContext(this.injector, async () => {
      const a = inject(AdditionService);
      await new Promise(res => setTimeout(res, 3000));
      return a;
    });

    console.log('MY Addition service is ', x.id);
    const res = this.additionService.add(this.x(), this.y());
    this.result.set(res);
  }
}
