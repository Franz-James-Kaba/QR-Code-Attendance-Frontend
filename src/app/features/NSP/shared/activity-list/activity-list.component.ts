import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Activity {
  type: string;
  icon: string;
  date: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <div *ngFor="let activity of activities"
           class="bg-[#E0F0FE] rounded-xl p-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <img [src]="activity.icon" alt="" class="mr-2" />
            <div>
              <p class="font-bold text-base text-[#292929]">{{ activity.type }}</p>
              <p class="font-normal text-xs text-[#464646]">{{ activity.date }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium text-gray-800">{{ activity.time }}</p>
            <p class="text-xs text-gray-500">{{ activity.status }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ActivityListComponent {
  activities: Activity[] = [
    {
      type: 'Check In',
      icon: '',
      date: 'March 21, 2025',
      time: '6:58 am',
      status: 'On time'
    },
    {
      type: 'Check Out',
      icon: '',
      date: 'March 21, 2025',
      time: '4:30 pm',
      status: 'On time'
    }
  ];
}
