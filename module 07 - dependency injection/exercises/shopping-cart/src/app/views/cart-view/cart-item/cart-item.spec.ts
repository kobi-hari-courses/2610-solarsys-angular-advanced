import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartItemPresenter } from './cart-item';

describe('CartItem', () => {
  let component: CartItemPresenter;
  let fixture: ComponentFixture<CartItemPresenter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartItemPresenter],
    }).compileComponents();

    fixture = TestBed.createComponent(CartItemPresenter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
