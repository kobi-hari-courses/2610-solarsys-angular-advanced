import { Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { buildCartVm } from './cart.vm';

describe('buildCartVm', () => {
  const products: Product[] = [
    { id: 'book', name: 'Angular Book', category: 'Books', price: 19.5 },
    { id: 'pen', name: 'Blue Pen', category: 'Stationery', price: 2.25 },
    { id: 'gift', name: 'Free Gift', category: 'Promotions', price: 0 },
  ];

  it.each([
    { description: 'empty', catalog: [] },
    { description: 'populated', catalog: products },
  ])('returns zero totals for an empty cart with a $description catalog', ({ catalog }) => {
    expect(buildCartVm({ items: [] }, catalog)).toEqual({
      items: [],
      subtotal: 0,
      quantity: 0,
    });
  });

  it('looks up products by ID, preserves cart order, and counts units rather than lines', () => {
    const cart: Cart = {
      items: [
        { productId: 'pen', quantity: 3 },
        { productId: 'book', quantity: 2 },
      ],
    };

    expect(buildCartVm(cart, products)).toEqual({
      items: [
        { productId: 'pen', productName: 'Blue Pen', quantity: 3, total: 6.75 },
        { productId: 'book', productName: 'Angular Book', quantity: 2, total: 39 },
      ],
      subtotal: 45.75,
      quantity: 5,
    });
  });

  it('keeps repeated product lines separate and includes each in the totals', () => {
    const cart: Cart = {
      items: [
        { productId: 'pen', quantity: 2 },
        { productId: 'pen', quantity: 3 },
      ],
    };

    expect(buildCartVm(cart, products)).toEqual({
      items: [
        { productId: 'pen', productName: 'Blue Pen', quantity: 2, total: 4.5 },
        { productId: 'pen', productName: 'Blue Pen', quantity: 3, total: 6.75 },
      ],
      subtotal: 11.25,
      quantity: 5,
    });
  });

  it('preserves zero-quantity lines and counts free products without increasing the subtotal', () => {
    const cart: Cart = {
      items: [
        { productId: 'book', quantity: 0 },
        { productId: 'gift', quantity: 4 },
        { productId: 'pen', quantity: 1 },
      ],
    };

    expect(buildCartVm(cart, products)).toEqual({
      items: [
        { productId: 'book', productName: 'Angular Book', quantity: 0, total: 0 },
        { productId: 'gift', productName: 'Free Gift', quantity: 4, total: 0 },
        { productId: 'pen', productName: 'Blue Pen', quantity: 1, total: 2.25 },
      ],
      subtotal: 2.25,
      quantity: 5,
    });
  });

  it('calculates decimal prices without rounding intermediate line totals', () => {
    const catalog: Product[] = [
      { id: 'small', name: 'Small Item', category: 'Other', price: 0.105 },
      { id: 'large', name: 'Large Item', category: 'Other', price: 0.205 },
    ];
    const cart: Cart = {
      items: [
        { productId: 'small', quantity: 3 },
        { productId: 'large', quantity: 2 },
      ],
    };

    const result = buildCartVm(cart, catalog);

    expect(result.items[0].total).toBeCloseTo(0.315, 10);
    expect(result.items[1].total).toBeCloseTo(0.41, 10);
    expect(result.subtotal).toBeCloseTo(0.725, 10);
    expect(result.quantity).toBe(5);
  });

  it.each(['__proto__', 'constructor', 'toString'])(
    'supports a product ID that matches an object property: %s',
    (id) => {
      const catalog: Product[] = [{ id, name: 'Special ID Product', category: 'Other', price: 7 }];

      expect(buildCartVm({ items: [{ productId: id, quantity: 2 }] }, catalog)).toEqual({
        items: [{ productId: id, productName: 'Special ID Product', quantity: 2, total: 14 }],
        subtotal: 14,
        quantity: 2,
      });
    },
  );

  it('throws when a cart product is missing instead of returning a partial subtotal', () => {
    const cart: Cart = {
      items: [
        { productId: 'book', quantity: 1 },
        { productId: 'missing', quantity: 2 },
      ],
    };

    expect(() => buildCartVm(cart, products)).toThrow(TypeError);
  });

  it('does not mutate its inputs and produces the same result on repeated calls', () => {
    const cart: Cart = { items: [{ productId: 'pen', quantity: 2 }] };
    const catalog: Product[] = products.map((product) => ({ ...product }));
    const originalCart = structuredClone(cart);
    const originalCatalog = structuredClone(catalog);
    cart.items.forEach(Object.freeze);
    catalog.forEach(Object.freeze);
    Object.freeze(cart.items);
    Object.freeze(cart);
    Object.freeze(catalog);

    const first = buildCartVm(cart, catalog);
    const second = buildCartVm(cart, catalog);

    expect(first).toEqual({
      items: [{ productId: 'pen', productName: 'Blue Pen', quantity: 2, total: 4.5 }],
      subtotal: 4.5,
      quantity: 2,
    });
    expect(second).toEqual(first);
    expect(cart).toEqual(originalCart);
    expect(catalog).toEqual(originalCatalog);
  });
});
