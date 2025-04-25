import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface SummaryCard {
  icon: string;
  title: string;
  value: string;
  description: string;
}

@Component({
  selector: 'app-attendance-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 gap-4">
      <div
        *ngFor="let card of summaryCards"
        [ngClass]="{
          '': card.title === 'Check In' || card.title === 'Check Out',
          '': card.title === 'Break Time' || card.title === 'Total Days',
        }"
        class="w-full rounded-xl p-4 bg-[#082B49] text-white"
      >
        <div class="flex items-center mb-2">
          <img [src]="card.icon" [alt]="card.title" class="mr-2 w-5 h-5" />
          <span class="text-sm font-medium text-white">{{ card.title }}</span>
        </div>
        <div>
          <p class="font-semibold text-base text-white">{{ card.value }}</p>
          <p class="text-white text-xs font-normal">{{ card.description }}</p>
        </div>
      </div>
    </div>
  `,
})
export class AttendanceSummaryComponent {
 public summaryCards: SummaryCard[] = [
    {
      icon: '../../../assets/icons/check-in.svg',
      title: 'Check In',
      value: '6:58 am',
      description: 'Average Check In Time',
    },
    {
      icon: '../../../assets/icons/check-out.svg',
      title: 'Check Out',
      value: '6:58 am',
      description: 'Average Check Out Time',
    },
    {
      icon: '../../../assets/icons/break-time.svg',
      title: 'Break Time',
      value: '6:58 am',
      description: 'Average Break Time',
    },
    {
      icon: '../../../assets/icons/calender.svg',
      title: 'Total Days',
      value: '28',
      description: 'Working Days',
    },
  ];
}
