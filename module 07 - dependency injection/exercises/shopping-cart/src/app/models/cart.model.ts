export interface CartItem {
    readonly productId: string;
    readonly quantity: number;
}

export interface Cart {
    readonly items: CartItem[];
}