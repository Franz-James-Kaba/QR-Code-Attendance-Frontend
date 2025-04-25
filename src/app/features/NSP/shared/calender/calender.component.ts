import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, AfterViewInit } from '@angular/core';

interface CalendarDate {
  day: number;
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-calender',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex space-x-3 py-2 overflow-x-auto">
      <div
        *ngFor="let date of dates"
        (click)="selectDate(date)"
        [attr.id]="date.active ? 'active-date' : null"
        [ngClass]="{
          'bg-[#082B49] text-white': date.active,
          'bg-gray-100 text-gray-700': !date.active
        }"
        class="flex flex-col cursor-pointer items-center rounded-xl py-2 px-4 min-w-[60px]"
      >
        <span class="font-semibold text-xl">{{ date.day }}</span>
        <span class="text-sm">{{ date.name }}</span>
      </div>
    </div>
  `,
})
export class CalenderComponent implements OnInit, AfterViewInit {
  @Output() daySelected = new EventEmitter<Date>();

  public dates: CalendarDate[] = [];

  ngOnInit() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const userLocale = navigator.language;

    this.dates = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateObj = new Date(currentYear, currentMonth, day);
      return {
        day,
        name: dateObj.toLocaleDateString(userLocale, { weekday: 'short' }),
        active: day === currentDay,
      };
    });
  }

  ngAfterViewInit() {
    const activeElement = document.getElementById('active-date');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }

  public selectDate(selected: CalendarDate) {
    this.dates = this.dates.map(date => ({
      ...date,
      active: date.day === selected.day,
    }));
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const selectedDate = new Date(currentYear, currentMonth, selected.day);
    this.daySelected.emit(selectedDate);
  }
}
