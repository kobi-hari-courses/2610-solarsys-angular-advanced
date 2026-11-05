import { Component, inject } from '@angular/core';
import { Calc } from './components/calc/calc';
import { Group } from './components/group/group';
import { NAV_ITEM } from './tokens/nav-item.token';

@Component({
  selector: 'app-root',
  imports: [Calc, Group],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly navItems = inject(NAV_ITEM);
}
