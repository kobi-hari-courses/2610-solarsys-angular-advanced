import { Component, computed, inject } from '@angular/core';
import { CatalogueView } from './views/catalogue-view/catalogue-view';
import { SummaryView } from './views/summary-view/summary-view';
import { CartView } from './views/cart-view/cart-view';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [CatalogueView, SummaryView, CartView],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly #cartService = inject(CartService);
  readonly cartCount = computed(() => this.#cartService.cartVm().quantity);
}
