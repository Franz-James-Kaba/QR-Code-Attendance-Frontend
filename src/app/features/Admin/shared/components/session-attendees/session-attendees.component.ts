import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Attendee } from '../../models/attendance.model';

@Component({
  selector: 'app-session-attendees',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-6">Session Attendees</h2>

      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let attendee of attendees" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{{ attendee.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatTime(attendee.checkInTime) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ attendee.checkOutTime ? formatTime(attendee.checkOutTime) : '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [ngClass]="getStatusClass(attendee.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ attendee.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class SessionAttendeesComponent {
  @Input() sessionId!: number;
  @Input() attendees: Attendee[] = [];

  formatTime(timeStr: string): string {
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  getStatusClass(status: string): string {
    const classes = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
    };
    return classes[status as keyof typeof classes] || '';
  }
}
