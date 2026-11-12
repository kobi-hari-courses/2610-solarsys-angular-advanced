import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { NumberSpinner } from '../../components/number-spinner/number-spinner';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [NumberSpinner, CurrencyPipe],
  selector: 'app-cart-view',
  styleUrl: './cart-view.css',
  templateUrl: './cart-view.html',
  host: {
    'class': 'card'
  }
})
export class CartView {
  readonly cartService = inject(CartService);

  readonly vm = this.cartService.cartVm;
}
