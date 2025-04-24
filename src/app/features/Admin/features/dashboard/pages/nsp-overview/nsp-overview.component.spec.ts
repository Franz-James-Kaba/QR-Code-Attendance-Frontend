import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NspOverviewComponent } from './nsp-overview.component';

describe('NspOverviewComponent', () => {
  let component: NspOverviewComponent;
  let fixture: ComponentFixture<NspOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NspOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NspOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
