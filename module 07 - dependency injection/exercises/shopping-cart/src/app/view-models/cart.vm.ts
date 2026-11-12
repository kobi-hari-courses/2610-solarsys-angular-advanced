import { Cart, CartItem } from "../models/cart.model";
import { Product } from "../models/product.model";
import { sum } from "../utils/math-utils";

export interface CartItemVm {
    readonly productId: string;
    readonly productName: string;
    readonly quantity: number;
    readonly total: number;
}

export interface CartVm {
    readonly items: CartItemVm[];
    readonly subtotal: number;
    readonly quantity: number;
}

export function buildCartVm(cart: Cart, products: Product[]): CartVm {
    const productEntries = products.map(p => [p.id, p] as const);

    const productsMap = Object.fromEntries(productEntries);
    const cartItemVms = cart.items.map(i => buildCartItemVm(i));
    const subtotal = sum(cartItemVms, c => c.total);
    const quantity = sum(cartItemVms, c => c.quantity);
   
    return {
        items: cartItemVms, 
        subtotal, 
        quantity
    }

    function buildCartItemVm(cartItem: CartItem): CartItemVm {
        const product = productsMap[cartItem.productId];
        const total = cartItem.quantity * product.price;

        return {
            productId: product.id, 
            productName: product.name, 
            quantity: cartItem.quantity, 
            total
        }
    }

}

