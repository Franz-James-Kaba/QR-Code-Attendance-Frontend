import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent]
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
      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container).toBeTruthy();
    });

    it('should render inline variant', () => {
      component.variant = 'inline';
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.loading-inline'));
      expect(container).toBeTruthy();
    });

    it('should render fullscreen variant', () => {
      component.variant = 'fullscreen';
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.loading-fullscreen'));
      expect(container).toBeTruthy();
    });

    it('should render button variant', () => {
      component.variant = 'button';
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.loading-button'));
      expect(container).toBeTruthy();
    });
  });

  describe('Size classes', () => {
    ['sm', 'md', 'lg'].forEach(size => {
      it(`should apply ${size} size class`, () => {
        component.size = size as 'sm' | 'md' | 'lg';
        fixture.detectChanges();
        const element = fixture.debugElement.query(By.css(`.${size}`));
        expect(element).toBeTruthy();
      });
    });
  });

  describe('Color classes', () => {
    ['primary', 'secondary', 'tertiary'].forEach(color => {
      it(`should apply ${color} color class`, () => {
        component.color = color as 'primary' | 'secondary' | 'tertiary';
        fixture.detectChanges();
        const element = fixture.debugElement.query(By.css(`.${color}`));
        expect(element).toBeTruthy();
      });
    });
  });

  describe('Text rendering', () => {
    it('should show text when provided', () => {
      component.text = 'Loading...';
      fixture.detectChanges();
      const text = fixture.debugElement.query(By.css('.loading-text'));
      expect(text?.nativeElement.textContent.trim()).toBe('Loading...');
    });

    it('should not show text when empty', () => {
      component.text = '';
      fixture.detectChanges();
      const text = fixture.debugElement.query(By.css('.loading-text'));
      expect(text).toBeNull();
    });
  });
});