import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalenderComponent } from './calender.component';

describe('CalenderComponent', () => {
  let component: CalenderComponent;
  let fixture: ComponentFixture<CalenderComponent>;

  beforeEach(async () => {
    jest.spyOn(document, 'getElementById').mockImplementation(id => {
      if (id === 'active-date') {
        return { scrollIntoView: jest.fn() } as any;
      }
      return null;
    });

    await TestBed.configureTestingModule({
      imports: [CommonModule, CalenderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dates for the current month', () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    expect(component.dates.length).toBe(daysInMonth);
    expect(component.dates[0].day).toBe(1);
    expect(component.dates[component.dates.length - 1].day).toBe(daysInMonth);
    expect(component.dates[component.currentDay - 1].active).toBe(true);
    expect(component.dates[component.currentDay].selectable).toBe(false);
  });

  it('should emit selected date when a selectable date is clicked', () => {
    jest.spyOn(component.daySelected, 'emit');
    const selectableDate = component.dates.find(date => date.selectable);

    if (selectableDate) {
      component.selectDate(selectableDate);
      const expectedDate = new Date(new Date().getFullYear(), new Date().getMonth(), selectableDate.day);
      expect(component.daySelected.emit).toHaveBeenCalledWith(expectedDate);
      expect(component.dates.find(date => date.day === selectableDate.day)?.active).toBe(true);
    }
  });

  it('should not emit or change active state for non-selectable date', () => {
    jest.spyOn(component.daySelected, 'emit');
    const nonSelectableDate = component.dates.find(date => !date.selectable);

    if (nonSelectableDate) {
      component.selectDate(nonSelectableDate);
      expect(component.daySelected.emit).not.toHaveBeenCalled();
      expect(component.dates.find(date => date.day === nonSelectableDate.day)?.active).toBe(false);
    }
  });

  it('should scroll to active date after view initialization', () => {
    const scrollIntoViewSpy = jest.fn();
    jest.spyOn(document, 'getElementById').mockReturnValueOnce({
      scrollIntoView: scrollIntoViewSpy,
    } as any);

    component.ngAfterViewInit();

    expect(document.getElementById).toHaveBeenCalledWith('active-date');
    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', inline: 'center' });
  });

  it('should handle ArrowRight key to select next selectable date', () => {
    jest.spyOn(component.daySelected, 'emit');
    const currentIndex = component.dates.findIndex(date => date.active);
    const nextIndex = currentIndex + 1;

    if (nextIndex < component.dates.length && component.dates[nextIndex].selectable) {
      const mockElement = { focus: jest.fn() };
      jest.spyOn(document, 'querySelectorAll').mockReturnValue([null, mockElement] as any);

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      component.onKeyDown(event, currentIndex);

      expect(component.dates[nextIndex].active).toBe(true);
      expect(mockElement.focus).toHaveBeenCalled();
      expect(component.daySelected.emit).toHaveBeenCalled();
    }
  });

  it('should not change selection if arrow keys target non-selectable date', () => {
    jest.spyOn(component.daySelected, 'emit');
    const currentIndex = component.dates.findIndex(date => date.active);
    const nextIndex = currentIndex + 1;

    if (nextIndex < component.dates.length && !component.dates[nextIndex].selectable) {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      component.onKeyDown(event, currentIndex);

      expect(component.dates[nextIndex].active).toBe(false);
      expect(component.daySelected.emit).not.toHaveBeenCalled();
    }
  });

  it('should prevent default behavior for arrow key events', () => {
    const preventDefaultSpy = jest.fn();
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });

    component.onKeyDown(event, 0);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
