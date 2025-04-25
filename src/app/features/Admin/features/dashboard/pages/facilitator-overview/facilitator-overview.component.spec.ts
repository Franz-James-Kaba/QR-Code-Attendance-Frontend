import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitatorOverviewComponent } from './facilitator-overview.component';

describe('FacilitatorOverviewComponent', () => {
  let component: FacilitatorOverviewComponent;
  let fixture: ComponentFixture<FacilitatorOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilitatorOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilitatorOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
