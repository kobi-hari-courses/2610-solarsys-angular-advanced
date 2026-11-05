import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoService } from './services/todo.service';
import { TabsStrip } from './components/tabs-strip/tabs-strip';
import { TodoItemComponent } from './components/todo-item/todo-item';
import { AddItem } from './components/add-item/add-item';
import { injectTodoFilters } from './tokens/todo-filter.token';

@Component({
  selector: 'app-root',
  imports: [TabsStrip, TodoItemComponent, AddItem],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly todoService = inject(TodoService);
  readonly filters = injectTodoFilters();
  readonly tabs = computed(() => this.filters.map(f => f.displayName));
  readonly selectedTab = signal('All');
  readonly selectedFilter = computed(() => this.filters.find(f => f.displayName === this.selectedTab())!);

  readonly todos = computed(() => 
    this.todoService.items()
        .filter(item => this.selectedFilter().predicate(item)));


  constructor() {
    console.log(this.filters);
  }

}
