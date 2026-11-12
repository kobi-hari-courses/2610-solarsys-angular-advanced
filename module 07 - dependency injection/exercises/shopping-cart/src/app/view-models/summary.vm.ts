import { Adjustment, PricingRule } from "../models/pricing-rule.model";

export interface AdjustmentVM {
    readonly description: string;
    readonly amount: number;
}

export interface SummaryVM {
    readonly subtotal: number;
    readonly adjustments: AdjustmentVM[];
    readonly total: number;
}

export function buildSummaryVm(subtotal: number, rules: PricingRule[]): SummaryVM {

    let runningTotal = subtotal;
    const adjustmentVms = rules.map(rule => {
        const amount = rule.adjustment(runningTotal);
        runningTotal += amount;
        const res: AdjustmentVM = {
            amount, 
            description: rule.name
        }
        return res;
    })

    return {
        subtotal, 
        adjustments: adjustmentVms, 
        total: runningTotal
    }
}