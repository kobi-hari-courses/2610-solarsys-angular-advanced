import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { User } from './models/user.model';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly isBusy = signal(false);
  readonly users = signal<User[]>([]);
  readonly #dataService = inject(DataService);

  getAllUsers() {
    this.isBusy.set(true);
    const r$ = this.#dataService.getAllUsers();
    console.log('Completed calling getAllUsers');
    r$.subscribe((res) => {
      this.isBusy.set(false);
      this.users.set(res);
    });
  }

  addNewUser(name: string, email: string) {
    this.isBusy.set(true);
    const r$ = this.#dataService.addNewUser(name, email);
    r$.subscribe((res) => {
      this.isBusy.set(false);
      this.users.update(users => [...users, res]);
    });
  }

  deleteUser(id: string) {
    this.isBusy.set(true);
    const r$ = this.#dataService.deleteUser(id);
    r$.subscribe(() => {
      this.isBusy.set(false);
      this.users.update(users => users.filter(user => user.id !== id));
    });
  }
}
