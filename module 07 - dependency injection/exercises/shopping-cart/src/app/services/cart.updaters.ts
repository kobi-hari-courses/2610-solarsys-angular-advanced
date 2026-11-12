import { produce } from "immer";
import { Cart } from "../models/cart.model";

export function addProductToCart(cart: Cart, productId: string): Cart {
    if (cart.items.some(i => i.productId === productId)) {
        return {
            ...cart, 
            items: cart.items.map(item => item.productId === productId 
                ? {...item, quantity: item.quantity + 1}
                : item
            )
        }
    }

    return {
        ...cart, 
        items: [...cart.items, {
            productId, 
            quantity: 1
        }]
    }
}

export function removeProductFromCart(cart: Cart, productId: string): Cart {
    if (cart.items.some(i => i.productId === productId)) {
        return {
            ...cart, 
            items: cart.items.filter(item => item.productId !== productId)
        }
    }

    return cart;    
}

export function incrementProductInCart(cart: Cart, productId: string): Cart {
    return produce(cart, draft => {
        const item = draft.items.find(i => i.productId === productId);
        if (item) {
            item.quantity++;
        }
    })
    
}

export function decrementProductInCart(cart: Cart, productId: string): Cart {
    return produce(cart, draft => {
        const item = draft.items.find(i => i.productId === productId);

        if (!item) return;

        if (item.quantity > 1) {
            item.quantity--;
            return;
        }

        draft.items = draft.items.filter(item => item.productId !== productId);
    })
    
}