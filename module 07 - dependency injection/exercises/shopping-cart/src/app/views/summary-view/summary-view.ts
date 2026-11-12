import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-summary-view',
  styleUrl: './summary-view.css',
  templateUrl: './summary-view.html',
  host: {
    'class': 'card'
  }
})
export class SummaryView {
  readonly cartService = inject(CartService);
  readonly vm = this.cartService.summaryVm;
}
