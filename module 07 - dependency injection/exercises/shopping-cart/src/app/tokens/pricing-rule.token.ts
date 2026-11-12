import { EnvironmentProviders, inject, InjectionToken, makeEnvironmentProviders } from "@angular/core";
import { PricingRule } from "../models/pricing-rule.model";

const PRICING_RULE = new InjectionToken<PricingRule[]>('PRICING_RULE');

export function providePricingRule(rule: PricingRule): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: PRICING_RULE,
            useValue: rule, 
            multi: true 
        }
    ])
}

export function providePricingRules(rules: PricingRule[]): EnvironmentProviders {
    return makeEnvironmentProviders(
        rules.map(r => providePricingRule(r))
    )
}

export function injectPricingRules(): PricingRule[] {
    return inject(PRICING_RULE);
}