import { Component, input, output } from '@angular/core';
import { TodoItem } from '../../models/todo-item.model';

@Component({
  imports: [],
  selector: 'app-todo-item',
  styleUrl: './todo-item.css',
  templateUrl: './todo-item.html',
  host: {
    '[class.completed]': 'item().isCompleted'
  }
})
export class TodoItemComponent {
  readonly item = input.required<TodoItem>();

  readonly toggle = output<void>();
  readonly delete = output<void>();
}
