import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SlideButtonComponent } from './slide-button.component';

@Component({
  selector: 'app-icon',
  template: '',
})
class MockIconComponent {
  @Input() path: string = '';
  @Input() viewBox: string = '';
  @Input() size: number = 0;
  @Input() svgwidth: number = 0;
  @Input() svgHeight: number = 0;
}

describe('SlideButtonComponent', () => {
  let component: SlideButtonComponent;
  let fixture: ComponentFixture<SlideButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, SlideButtonComponent, MockIconComponent],
    })
      .overrideComponent(SlideButtonComponent, {
        set: {
          imports: [CommonModule, MockIconComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SlideButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render button with correct classes', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.classList).toContain('w-full');
    expect(button.classList).toContain('bg-primary');
    expect(button.classList).toContain('text-white');
    expect(button.classList).toContain('py-4');
    expect(button.classList).toContain('px-6');
    expect(button.classList).toContain('rounded-xl');
    expect(button.classList).toContain('shadow-(#00000026)');
    expect(button.classList).toContain('flex');
    expect(button.classList).toContain('items-center');
    expect(button.classList).toContain('justify-center');
    expect(button.classList).toContain('text-base');
    expect(button.classList).toContain('font-bold');
    expect(button.classList).toContain('gap-2');
  });

  it('should render icon with correct properties', () => {
    const icon = fixture.debugElement.query(By.css('app-icon'))
      .componentInstance as MockIconComponent;
    expect(icon).toBeTruthy();

    expect(icon.viewBox).toBe('0 0 21 16');
    expect(icon.size).toBe(18);
    expect(icon.svgwidth).toBe(21);
    expect(icon.svgHeight).toBe(16);
    expect(icon.path).toBe(
      'M15.5 9L19.5 5M19.5 5L15.5 1M19.5 5H6.5C3.73858 5 1.5 7.23858 1.5 10C1.5 12.7614 3.73858 15 6.5 15H11.5'
    );
  });

  it('should display "Click to Check In" when isCheckedIn is false', () => {
    component.isCheckedIn = false;
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span).toBeTruthy();
    expect(span.textContent).toBe('Click to Check In');
  });

  it('should display "Click to Check Out" when isCheckedIn is true', () => {
    component.isCheckedIn = true;
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span).toBeTruthy();
    expect(span.textContent).toBe('Click to Check Out');
  });

  it('should emit scanRequested event when button is clicked', () => {
    const scanRequestedSpy = jest.spyOn(component.scanRequested, 'emit');
    const button = fixture.nativeElement.querySelector('button');

    button.click();
    fixture.detectChanges();

    expect(scanRequestedSpy).toHaveBeenCalled();
    expect(scanRequestedSpy).toHaveBeenCalledWith();
  });

  it('should have default isCheckedIn value of false', () => {
    expect(component.isCheckedIn).toBe(false);
  });
});
