/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NspComponent } from './nsp.component';

describe('NspComponent', () => {
  let component: NspComponent;
  let fixture: ComponentFixture<NspComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NspComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(NspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
