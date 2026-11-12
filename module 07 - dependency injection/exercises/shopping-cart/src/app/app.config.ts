import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePricingRule } from './tokens/pricing-rule.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePricingRule({
      name: 'Member Discount',
      adjustment: (s) => -0.1 * s,
    }),
    providePricingRule({
      name: 'Shipping',
      adjustment: (s) => 4,
    }),
    providePricingRule({
      name: 'Coupon',
      adjustment: (s) => -3,
    }),
  ],
};
