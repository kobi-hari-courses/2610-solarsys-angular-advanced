import { Component, inject } from '@angular/core';
import { CatalgueService } from '../../services/catalogue.service';
import { ProductItem } from './product-item/product-item';
import { CartService } from '../../services/cart.service';

@Component({
  imports: [ProductItem],
  selector: 'app-catalogue-view',
  styleUrl: './catalogue-view.css',
  templateUrl: './catalogue-view.html',
})
export class CatalogueView {
  readonly catalogueService = inject(CatalgueService);
  readonly cartService = inject(CartService);

  readonly filters = this.catalogueService.filters;
  readonly selectedFilter = this.catalogueService.selectedFilterName;

  readonly products = this.catalogueService.visibleProducts;

}
