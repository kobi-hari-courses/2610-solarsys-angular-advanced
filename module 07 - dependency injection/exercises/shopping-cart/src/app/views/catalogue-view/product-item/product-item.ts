import { Component, computed, input, output } from '@angular/core';
import { Product } from '../../../models/product.model';

@Component({
  imports: [],
  selector: 'app-product-item',
  styleUrl: './product-item.css',
  templateUrl: './product-item.html',
  host: {
    'class': 'card'
  }
})
export class ProductItem {
  readonly product = input.required<Product>();

  readonly price = computed(() => `${this.product().price.toFixed(2)}$`)


  readonly addToCart = output();

}
