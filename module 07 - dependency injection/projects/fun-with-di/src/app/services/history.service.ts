import { effect, inject, Injectable, Service, signal } from '@angular/core';
import { HISTORY_PREFIX } from '../tokens/prefix.token';

@Service()
export class HistoryService {
  readonly id = Math.ceil(Math.random() * 100000);
  readonly records = signal<string[]>([]);
  readonly prefix = inject(HISTORY_PREFIX);

  constructor() {
    console.log('History Service Created with id: ', this.id);
    effect(() => {
      console.log('History changed', this.records());
    });
  }

  audit(txt: string) {
    this.records.update((v) => [...v, `${this.prefix}: ${txt}`]);
  }
}
