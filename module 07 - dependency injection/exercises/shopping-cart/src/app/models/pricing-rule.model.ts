export type Adjustment = (subtotal: number) => number;

export interface PricingRule {
    readonly name: string;
    readonly adjustment: Adjustment
}