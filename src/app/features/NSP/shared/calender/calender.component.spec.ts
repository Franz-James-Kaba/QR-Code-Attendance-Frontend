import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CalendarDate } from '@app/features/NSP/models/nsp.interface';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectDate } from '@store/actions/attendance.actions';

import { CalenderComponent } from './calender.component';

interface ScrollIntoViewOptions {
  behavior?: 'auto' | 'smooth';
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
}

interface MockElement extends HTMLElement {
  scrollIntoView: jest.Mock<void, [ScrollIntoViewOptions | boolean]>;
}

describe('CalenderComponent', () => {
  let component: CalenderComponent;
  let fixture: ComponentFixture<CalenderComponent>;
  let store: MockStore;
  let mockScrollIntoView: jest.Mock<void, [ScrollIntoViewOptions | boolean]>;
  let mockQuerySelectorAll: jest.Mock;

  const mockCurrentDate = new Date(2025, 4, 18);
  const originalDate = Date;

  beforeEach(async () => {
    mockScrollIntoView = jest.fn();
    mockQuerySelectorAll = jest.fn().mockReturnValue([]);

    jest.spyOn(document, 'getElementById').mockImplementation((id: string): MockElement | null => {
      if (id === 'active-date') {
        return { scrollIntoView: mockScrollIntoView } as MockElement;
      }
      return null;
    });

    type DateArgs =
      | []
      | [number | string | Date]
      | [number, number]
      | [number, number, number]
      | [number, number, number, number]
      | [number, number, number, number, number]
      | [number, number, number, number, number, number]
      | [number, number, number, number, number, number, number];

    jest.spyOn(window, 'Date').mockImplementation((...args: DateArgs): Date => {
      if (args.length === 0) {
        return new originalDate(mockCurrentDate);
      }
      if (args.length === 1) {
        return new originalDate(args[0]);
      }
      if (args.length === 2) {
        return new originalDate(args[0], args[1]);
      }
      if (args.length === 3) {
        return new originalDate(args[0], args[1], args[2]);
      }
      if (args.length === 4) {
        return new originalDate(args[0], args[1], args[2], args[3]);
      }
      if (args.length === 5) {
        return new originalDate(args[0], args[1], args[2], args[3], args[4]);
      }
      if (args.length === 6) {
        return new originalDate(args[0], args[1], args[2], args[3], args[4], args[5]);
      }
      return new originalDate(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    });

    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });

    jest.spyOn(document, 'querySelectorAll').mockImplementation(mockQuerySelectorAll);

    await TestBed.configureTestingModule({
      imports: [CommonModule, CalenderComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(CalenderComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('ngOnInit', () => {
    it('should initialize dates for May 2025 with correct properties', () => {
      fixture.detectChanges();

      const expectedLength = 31;
      expect(component.dates.length).toBe(expectedLength);
      expect(component.currentDay).toBe(18);

      expect(component.dates[0]).toEqual({
        day: 1,
        name: 'Thu',
        active: false,
        selectable: true,
      });
      expect(component.dates[17]).toEqual({
        day: 18,
        name: 'Sun',
        active: true,
        selectable: true,
      });
      expect(component.dates[18]).toEqual({
        day: 19,
        name: 'Mon',
        active: false,
        selectable: false,
      });
    });
  });

  describe('ngAfterViewInit', () => {
    it('should scroll to active date if present', fakeAsync(() => {
      fixture.detectChanges();
      component.ngAfterViewInit();
      tick();

      expect(document.getElementById).toHaveBeenCalledWith('active-date');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', inline: 'center' });
    }));

    it('should not call scrollIntoView if no active date', fakeAsync(() => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      fixture.detectChanges();
      component.ngAfterViewInit();
      tick();

      expect(document.getElementById).toHaveBeenCalledWith('active-date');
      expect(mockScrollIntoView).toHaveBeenCalledTimes(0);
    }));
  });

  describe('selectDate', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update active date and dispatch selectDate action for selectable date', () => {
      const selectedDate: CalendarDate = { day: 15, name: 'Thu', active: false, selectable: true };
      component.selectDate(selectedDate);

      expect(component.dates[14].active).toBe(true);
      expect(component.dates[17].active).toBe(false);
      expect(component.dates[0].active).toBe(false);

      const expectedDate = new Date(2025, 4, 15);
      expect(store.dispatch).toHaveBeenCalledWith(selectDate({ date: expectedDate }));
    });

    it('should not update dates or dispatch action for non-selectable date', () => {
      const selectedDate: CalendarDate = { day: 19, name: 'Mon', active: false, selectable: false };
      component.selectDate(selectedDate);

      expect(component.dates[17].active).toBe(true);
      expect(component.dates[18].active).toBe(false);
      expect(store.dispatch).toHaveBeenCalledTimes(0);
    });
  });

  describe('onKeyDown', () => {
    let mockFocus: jest.Mock<void, []>;

    beforeEach(() => {
      fixture.detectChanges();
      mockFocus = jest.fn();
      const mockElements = Array.from({ length: 31 }, () => ({ focus: mockFocus }));
      mockQuerySelectorAll.mockReturnValue(mockElements);
    });

    it('should navigate to previous selectable date on ArrowLeft', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      jest.spyOn(event, 'preventDefault');
      component.onKeyDown(event, 17);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.dates[16].active).toBe(true);
      expect(component.dates[17].active).toBe(false);
      expect(mockFocus).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(selectDate({ date: new Date(2025, 4, 17) }));
    });

    it('should navigate to next selectable date on ArrowRight', () => {
      component.dates = component.dates.map(date => ({
        ...date,
        active: date.day === 15,
      }));
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      jest.spyOn(event, 'preventDefault');
      component.onKeyDown(event, 14);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.dates[15].active).toBe(true);
      expect(component.dates[14].active).toBe(false);
      expect(mockFocus).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(selectDate({ date: new Date(2025, 4, 16) }));
    });

    it('should not navigate if previous date is out of bounds', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      jest.spyOn(event, 'preventDefault');
      component.onKeyDown(event, 0);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.dates[0].active).toBe(false);
      expect(mockFocus).toHaveBeenCalledTimes(0);
      expect(store.dispatch).toHaveBeenCalledTimes(0);
    });

    it('should not navigate if next date is not selectable', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      jest.spyOn(event, 'preventDefault');
      component.onKeyDown(event, 17);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.dates[17].active).toBe(true);
      expect(component.dates[18].active).toBe(false);
      expect(mockFocus).toHaveBeenCalledTimes(0);
      expect(store.dispatch).toHaveBeenCalledTimes(0);
    });
  });

  describe('template rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render correct number of date elements', () => {
      const listItems = fixture.nativeElement.querySelectorAll('li[role="button"]');
      expect(listItems.length).toBe(31);
    });

    it('should apply correct classes and attributes for active date', () => {
      const activeItem = fixture.nativeElement.querySelector('#active-date');
      expect(activeItem).toBeTruthy();
      expect(activeItem.classList.contains('bg-primary')).toBe(true);
      expect(activeItem.classList.contains('text-white')).toBe(true);
      expect(activeItem.getAttribute('aria-pressed')).toBe('true');
      expect(activeItem.getAttribute('tabindex')).toBe('0');
      expect(activeItem.textContent).toContain('18');
      expect(activeItem.textContent).toContain('Sun');
    });

    it('should apply correct classes for current day when not active', () => {
      component.dates = component.dates.map(date => ({
        ...date,
        active: date.day === 15,
      }));
      fixture.detectChanges();

      const currentDayItem = fixture.nativeElement.querySelectorAll('li[role="button"]')[17];
      expect(currentDayItem.classList.contains('border')).toBe(true);
      expect(currentDayItem.classList.contains('border-primary')).toBe(true);
      expect(currentDayItem.getAttribute('aria-pressed')).toBe('false');
    });

    it('should apply correct classes and attributes for non-selectable date', () => {
      const nonSelectableItem = fixture.nativeElement.querySelectorAll('li[role="button"]')[18];
      expect(nonSelectableItem.classList.contains('cursor-not-allowed')).toBe(true);
      expect(nonSelectableItem.classList.contains('opacity-50')).toBe(true);
      expect(nonSelectableItem.getAttribute('aria-disabled')).toBe('true');
      expect(nonSelectableItem.getAttribute('tabindex')).toBe('-1');
    });
  });
});
