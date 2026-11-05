import { Component, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-add-item',
  styleUrl: './add-item.css',
  templateUrl: './add-item.html',
})
export class AddItem {
  readonly added = output<string>();
}
