import { computed, Service, signal } from "@angular/core";
import { ALL_PRODUCTS } from "../data/all-products";
import { distinct } from "../utils/math-utils";
import { Product } from "../models/product.model";

interface Filter {
    readonly name: string;
    readonly condition: (p: Product) => boolean
}

@Service()
export class CatalgueService {
    readonly #products = signal(ALL_PRODUCTS);
    readonly products = this.#products.asReadonly();

    readonly categories = computed(() => distinct(this.#products(), p => p.category));

    readonly filters = computed<Filter[]>(() => [
        {name: 'All Categories', condition: p => true}, 
        ...this.categories().map(c => ({
            name: c, 
            condition: (p: Product) => p.category === c
        }))
    ]);

    readonly #selectedFilterName = signal('All Categories');
    readonly selectedFilterName = this.#selectedFilterName.asReadonly();

    readonly selectedFilter = computed(() => 
        this.filters().find(f => f.name === this.selectedFilterName())!);

    readonly visibleProducts = computed(() => 
        this.products().filter(p => this.selectedFilter().condition(p)));


    setSelectedFilter(filterName: string) {
        if (this.filters().some(f => f.name === filterName)) {
            this.#selectedFilterName.set(filterName);
        }
    }
}