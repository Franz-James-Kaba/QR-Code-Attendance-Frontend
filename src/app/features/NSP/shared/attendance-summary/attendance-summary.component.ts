import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AWARD_ICON, CALENDER_ICON, CHECK_IN_ICON, CHECK_OUT_ICON } from '@app/core/data/svg-data';

import { IconComponent } from "../../../../shared/components/icon/icon.component";
import { SummaryCard } from '../../models/nsp.interface';

@Component({
  selector: 'app-attendance-summary',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="grid grid-cols-2 gap-4">
      <div
        *ngFor="let card of summaryCards"
        class="w-full rounded-xl p-4 bg-primary text-white"
      >
        <div class="flex items-center gap-1 mb-1">
          <app-icon
            [path]="card.icon.path"
            [size]="card.icon.size"
            [viewBox]="card.icon.viewBox"
            class="w-5 h-5"
          />
          <span class="text-sm font-semibold text-white">{{ card.title }}</span>
        </div>
        <div>
          <p class="font-bold text-base text-white mb-1">{{ card.value }}</p>
          <p class="font-normal text-10 text-white">{{ card.description }}</p>
        </div>
      </div>
    </div>
  `,
})
export class AttendanceSummaryComponent {
 public summaryCards: SummaryCard[] = [
    {
      icon: CHECK_IN_ICON,
      title: 'Check In',
      value: '6:58 am',
      description: 'Average Check In Time',
    },
    {
      icon: CHECK_OUT_ICON,
      title: 'Check Out',
      value: '6:58 am',
      description: 'Average Check Out Time',
    },
    {
      icon: AWARD_ICON,
      title: 'Check-In Position',
      value: '12',
      description: 'Position on Attendance Table',
    },
    {
      icon: CALENDER_ICON,
      title: 'Total Days',
      value: '16/28',
      description: 'Working Days',
    },
  ];
}
