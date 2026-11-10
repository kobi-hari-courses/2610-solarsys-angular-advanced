import { Component, computed, debounced, inject, resource, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { User } from './models/user.model';
import { DataService } from './services/data.service';
import { Color } from './models/color.model';
import { ColorPresenter } from './components/color-presenter/color-presenter';
import { firstValueFrom } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { debounce } from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  imports: [ColorPresenter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly #dataService = inject(DataService);
  readonly searchText = signal('');
  readonly searchTrigger = debounced(this.searchText, 500);

  readonly colorsResource = rxResource({
    params: this.searchTrigger.value,
    stream: (ctx) => this.#dataService.searchColors(ctx.params)
  });

    readonly busy = computed(() => this.searchTrigger.isLoading() || this.colorsResource.isLoading());


  // readonly isBusy = signal(false);
  // readonly users = signal<User[]>([]);

  // getAllUsers() {
  //   this.isBusy.set(true);
  //   const r$ = this.#dataService.getAllUsers();
  //   console.log('Completed calling getAllUsers');
  //   r$.subscribe((res) => {
  //     this.isBusy.set(false);
  //     this.users.set(res);
  //   });
  // }

  // addNewUser(name: string, email: string) {
  //   this.isBusy.set(true);
  //   const r$ = this.#dataService.addNewUser(name, email);
  //   r$.subscribe((res) => {
  //     this.isBusy.set(false);
  //     this.users.update(users => [...users, res]);
  //   });
  // }

  // deleteUser(id: string) {
  //   this.isBusy.set(true);
  //   const r$ = this.#dataService.deleteUser(id);
  //   r$.subscribe(() => {
  //     this.isBusy.set(false);
  //     this.users.update(users => users.filter(user => user.id !== id));
  //   });
  // }
}
