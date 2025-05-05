import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  AfterViewInit,
  HostListener,
} from '@angular/core';

import { CalendarDate } from '../../models/nsp.interface';

@Component({
  selector: 'app-calender',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul class="flex space-x-3 py-2 overflow-x-auto" role="list">
      <li
        *ngFor="let date of dates; let i = index"
        (click)="date.selectable ? selectDate(date) : null"
        (keydown)="onKeyDown($event, i)"
        [attr.id]="date.active ? 'active-date' : null"
        [ngClass]="{
          'bg-primary text-white': date.active,
          'bg-lightGray text-nspText': !date.active,
          'cursor-pointer': date.selectable,
          'cursor-not-allowed opacity-50': !date.selectable,
          'border border-primary': date.day === currentDay && !date.active,
        }"
        class="flex flex-col items-center rounded-xl py-2 px-4 min-w-[3.75rem]"
        role="button"
        [attr.aria-pressed]="date.active"
        [attr.aria-disabled]="!date.selectable"
        [tabindex]="date.selectable ? 0 : -1"
      >
        <span class="font-normal text-xl">{{ date.day }}</span>
        <span class="text-sm">{{ date.name }}</span>
      </li>
    </ul>
  `,
})
export class CalenderComponent implements OnInit, AfterViewInit {
  @Output() daySelected = new EventEmitter<Date>();

  public dates: CalendarDate[] = [];
  public currentDay = new Date().getDate();

  ngOnInit() {
    this.initializeDates();
  }

  ngAfterViewInit() {
    this.scrollToActive();
  }

  private initializeDates(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const userLocale = navigator.language;

    this.dates = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateObj = new Date(currentYear, currentMonth, day);
      return {
        day,
        name: dateObj.toLocaleDateString(userLocale, { weekday: 'short' }),
        active: day === this.currentDay,
        selectable: day <= this.currentDay,
      };
    });
  }

  private scrollToActive(): void {
    const activeElement = document.getElementById('active-date');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }

  public selectDate(selected: CalendarDate) {
    if (!selected.selectable) return;

    this.dates = this.dates.map(date => ({
      ...date,
      active: date.day === selected.day,
    }));
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const selectedDate = new Date(currentYear, currentMonth, selected.day);
    this.daySelected.emit(selectedDate);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent, index: number): void {
    const isArrowLeft = event.key === 'ArrowLeft';
    const isArrowRight = event.key === 'ArrowRight';

    if (isArrowLeft || isArrowRight) {
      event.preventDefault();
      const newIndex = isArrowLeft ? index - 1 : index + 1;

      if (newIndex >= 0 && newIndex < this.dates.length) {
        const nextDate = this.dates[newIndex];
        if (nextDate.selectable) {
          this.selectDate(nextDate);
          const nextElement = document.querySelectorAll('[role="button"]')[newIndex] as HTMLElement;
          nextElement.focus();
        }
      }
    }
  }
}
