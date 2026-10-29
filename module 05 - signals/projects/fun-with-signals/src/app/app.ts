import { Component, computed, effect, linkedSignal, signal } from '@angular/core';
import { fakePeople } from './fake-data';
import { changeItem } from './utils/immutables';
import { changePersonExperience, selectByName, changeFirstExperienceOfSelectedPerson } from './people.helpers';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly people = signal(fakePeople);

  readonly names = computed(() => this.people().map((p) => p.name));

  readonly selectedPerson = signal(this.names()[0]);

  readonly selectedPersonDetails = computed(() =>
    this.people().find((p) => p.name === this.selectedPerson()),
  );

  changeSelectedEmail() {
    this.people.update((old) =>
      changeItem(
        old,
        selectByName(this.selectedPerson()),
        (_) => ({ email: 'newemail@example.com' }),
      ),
    );
  }

  changeFirstRoleToManager() {
    this.people.update(
      (old) => changeFirstExperienceOfSelectedPerson(old, this.selectedPerson(), 'manager'));
  }

  // readonly i = signal(0); // c

  // readonly j = signal(true); // c

  // readonly c = computed(() => this.j() ? this.i() : 0);  // value: 0 *, dep: d

  // readonly d = computed(() => this.c() * 2); // value 0 *: dep: e

  // readonly max = linkedSignal<number, number>({
  //   source: () => this.c(),
  //   computation: (prm, prev) => prm >= (prev?.value ?? prm)
  //     ? prm
  //     : prev!.value!
  // });

  // readonly name = signal('kobi');
  // readonly upper = linkedSignal(() => this.name().toUpperCase(), {
  //   set: val => this.name.set(val.toLowerCase())
  // });

  // // source current, source previous, value previous

  // constructor() {
  //   const e = effect(() => { // *
  //     console.log('D has changed to: ' + this.d());
  //   });
  // }

  // doSomething() {
  //   this.i.set(10);
  //   this.j.set(false);
  //   this.i.set(20);
  //   this.j.set(true);

  // }

  // // Current reactor = []
}

/*

      e (effect)
      |
      d (computed)
      |
      c (computed)
    /   \
    i (signal)   j (signal)


*/
