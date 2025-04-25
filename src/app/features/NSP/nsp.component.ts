import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CalenderComponent } from '@app/features/NSP/shared/calender/calender.component';

import { ActivityListComponent } from './shared/activity-list/activity-list.component';
import { AttendanceSummaryComponent } from './shared/attendance-summary/attendance-summary.component';
import { ProfileComponent } from './shared/profile/profile.component';
import { SlideButtonComponent } from './shared/slide-button/slide-button.component';

@Component({
  selector: 'nsp-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ProfileComponent,
    CalenderComponent,
    AttendanceSummaryComponent,
    ActivityListComponent,
    SlideButtonComponent,
  ],
  templateUrl: './nsp.component.html',
})
export class NspComponent {
  title = 'nsp-frontend';
}
