import { Component, inject } from '@angular/core';
import { CatalgueService } from '../../services/catalogue.service';
import { ProductItem } from './product-item/product-item';

@Component({
  imports: [ProductItem],
  selector: 'app-catalogue-view',
  styleUrl: './catalogue-view.css',
  templateUrl: './catalogue-view.html',
})
export class CatalogueView {
  readonly catalogueService = inject(CatalgueService);

  readonly filters = this.catalogueService.filters;
  readonly selectedFilter = this.catalogueService.selectedFilterName;

  readonly products = this.catalogueService.visibleProducts;

}
