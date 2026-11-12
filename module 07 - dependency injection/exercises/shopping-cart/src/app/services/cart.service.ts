import { computed, inject, Service, signal } from "@angular/core";
import { EMPTY_CART } from "../models/cart.model";
import { CatalgueService } from "./catalogue.service";
import { buildCartVm } from "../view-models/cart.vm";
import { injectPricingRules } from "../tokens/pricing-rule.token";
import { buildSummaryVm } from "../view-models/summary.vm";
import { addProductToCart, decrementProductInCart, incrementProductInCart, removeProductFromCart } from "./cart.updaters";

@Service()
export class CartService {
    readonly catalogue = inject(CatalgueService);
    readonly pricingRules = injectPricingRules();
    readonly #cart = signal(EMPTY_CART);

    readonly cartVm = computed(() => buildCartVm(this.#cart(), this.catalogue.products()));
    readonly summaryVm = computed(() => buildSummaryVm(this.cartVm().subtotal, this.pricingRules));


    addProductToCart(productId: string) {
        this.#cart.update(cart => addProductToCart(cart, productId))
    }

    removeProductFromCart(productId: string) {
        this.#cart.update(cart => removeProductFromCart(cart, productId))

    }

    incrementProductInCart(productId: string) {
        this.#cart.update(cart => incrementProductInCart(cart, productId))

    }
    
    decrementProductInCart(productId: string) {
        this.#cart.update(cart => decrementProductInCart(cart, productId))

    }
}