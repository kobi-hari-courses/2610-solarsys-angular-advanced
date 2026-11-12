import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryView } from './summary-view';

describe('SummaryView', () => {
  let component: SummaryView;
  let fixture: ComponentFixture<SummaryView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryView],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
