import { PricingRule } from '../models/pricing-rule.model';
import { buildSummaryVm } from './summary.vm';

describe('buildSummaryVm', () => {
  it.each([0, 100, 19.95])('preserves subtotal %s when there are no pricing rules', (subtotal) => {
    expect(buildSummaryVm(subtotal, [])).toEqual({
      subtotal,
      adjustments: [],
      total: subtotal,
    });
  });

  it('applies discounts and surcharges sequentially and preserves rule descriptions and order', () => {
    const rules: PricingRule[] = [
      { name: '10% discount', adjustment: (total) => -total * 0.1 },
      { name: 'Shipping', adjustment: () => 10 },
      { name: '20% tax', adjustment: (total) => total * 0.2 },
    ];

    expect(buildSummaryVm(200, rules)).toEqual({
      subtotal: 200,
      adjustments: [
        { description: '10% discount', amount: -20 },
        { description: 'Shipping', amount: 10 },
        { description: '20% tax', amount: 38 },
      ],
      total: 228,
    });
  });

  it('evaluates a threshold against the adjusted total, not the original subtotal', () => {
    const shipping = vi.fn((total: number) => (total >= 100 ? 0 : 10));
    const rules: PricingRule[] = [
      { name: 'Voucher', adjustment: () => -20 },
      { name: 'Shipping', adjustment: shipping },
    ];

    expect(buildSummaryVm(110, rules)).toEqual({
      subtotal: 110,
      adjustments: [
        { description: 'Voucher', amount: -20 },
        { description: 'Shipping', amount: 10 },
      ],
      total: 100,
    });
    expect(shipping).toHaveBeenCalledExactlyOnceWith(90);
  });

  it('retains a zero adjustment and still applies later rules', () => {
    const rules: PricingRule[] = [
      { name: 'No discount', adjustment: () => 0 },
      { name: 'Handling', adjustment: () => 5 },
    ];

    expect(buildSummaryVm(0, rules)).toEqual({
      subtotal: 0,
      adjustments: [
        { description: 'No discount', amount: 0 },
        { description: 'Handling', amount: 5 },
      ],
      total: 5,
    });
  });

  it.each([
    { discount: -100, total: 0 },
    { discount: -125, total: -25 },
  ])('does not clamp a total of $total after a discount of $discount', ({ discount, total }) => {
    const rules: PricingRule[] = [{ name: 'Voucher', adjustment: () => discount }];

    expect(buildSummaryVm(100, rules)).toEqual({
      subtotal: 100,
      adjustments: [{ description: 'Voucher', amount: discount }],
      total,
    });
  });

  it('passes a negative running total to subsequent rules', () => {
    const adjustment = vi.fn((total: number) => -total / 2);
    const rules: PricingRule[] = [
      { name: 'Voucher', adjustment: () => -125 },
      { name: 'Balance correction', adjustment },
    ];

    expect(buildSummaryVm(100, rules)).toEqual({
      subtotal: 100,
      adjustments: [
        { description: 'Voucher', amount: -125 },
        { description: 'Balance correction', amount: 12.5 },
      ],
      total: -12.5,
    });
    expect(adjustment).toHaveBeenCalledExactlyOnceWith(-25);
  });

  it('does not round fractional adjustments before applying the next rule', () => {
    const rules: PricingRule[] = [
      { name: '10% discount', adjustment: (total) => -total * 0.1 },
      { name: '20% tax', adjustment: (total) => total * 0.2 },
    ];

    const result = buildSummaryVm(19.99, rules);

    expect(result.subtotal).toBe(19.99);
    expect(result.adjustments.map((adjustment) => adjustment.description)).toEqual([
      '10% discount',
      '20% tax',
    ]);
    expect(result.adjustments[0].amount).toBeCloseTo(-1.999, 10);
    expect(result.adjustments[1].amount).toBeCloseTo(3.5982, 10);
    expect(result.total).toBeCloseTo(21.5892, 10);
  });

  it('does not mutate rules or retain a running total between calls', () => {
    const discount = (total: number) => -total * 0.1;
    const rules: PricingRule[] = [{ name: 'Discount', adjustment: discount }];
    rules.forEach(Object.freeze);
    Object.freeze(rules);

    const first = buildSummaryVm(100, rules);
    const second = buildSummaryVm(200, rules);

    expect(first).toEqual({
      subtotal: 100,
      adjustments: [{ description: 'Discount', amount: -10 }],
      total: 90,
    });
    expect(second).toEqual({
      subtotal: 200,
      adjustments: [{ description: 'Discount', amount: -20 }],
      total: 180,
    });
    expect(buildSummaryVm(100, rules)).toEqual(first);
    expect(rules).toEqual([{ name: 'Discount', adjustment: discount }]);
  });
});
