/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NspComponent } from './nsp.component';

describe('NspComponent', () => {
  let component: NspComponent;
  let fixture: ComponentFixture<NspComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NspComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
