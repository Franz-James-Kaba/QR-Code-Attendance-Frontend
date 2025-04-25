import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitatorLayoutComponent } from './facilitator-layout.component';

describe('FacilitatorLayoutComponent', () => {
  let component: FacilitatorLayoutComponent;
  let fixture: ComponentFixture<FacilitatorLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilitatorLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilitatorLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
