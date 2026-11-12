import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogueView } from './catalogue-view';

describe('CatalogueView', () => {
  let component: CatalogueView;
  let fixture: ComponentFixture<CatalogueView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogueView],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogueView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
