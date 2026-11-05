import { Service, signal } from '@angular/core';
import { TodoItem } from '../models/todo-item.model';

@Service()
export class TodoService {
  readonly #items = signal<TodoItem[]>([]);

  readonly items = this.#items.asReadonly();

  addItem(caption: string) {
    this.#items.update((v) => [
      ...v,
      {
        caption,
        isCompleted: false,
      },
    ]);
  }

  toggleItem(index: number) {
    this.#items.update((v) =>
      v.map((item, i) => (index !== i 
        ? item 
        : { 
            ...item, 
            isCompleted: !item.isCompleted 
        })),
    );
  }

  removeItem(index: number) {
    this.#items.update(v => v.filter((item, i) => i !== index));
  }
}
