import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.variant).toBe('default');
    expect(component.size).toBe('md');
    expect(component.color).toBe('primary');
    expect(component.text).toBe('');
  });

  describe('Variant rendering', () => {
    it('should render default variant', () => {
      const container = fixture.debugElement.query(By.css('.flex.flex-col'));
      expect(container).toBeTruthy();
    });

    it('should render inline variant', () => {
      component.variant = 'inline';
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.inline-flex'));
      expect(container).toBeTruthy();
    });

    it('should render fullscreen variant', () => {
      component.variant = 'fullscreen';
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.fixed.inset-0'));
      expect(container).toBeTruthy();
    });

    it('should render button variant', () => {
      component.variant = 'button';
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.opacity-70'));
      expect(container).toBeTruthy();
    });

    it('should render navigation variant', () => {
      component.variant = 'navigation';
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.fixed.inset-0'));
      expect(container).toBeTruthy();
      const card = fixture.debugElement.query(By.css('.bg-white'));
      expect(card).toBeTruthy();
    });
  });

  // Rest of your tests...
});