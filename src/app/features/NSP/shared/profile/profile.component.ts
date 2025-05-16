import { Component } from '@angular/core';
import { BELL_ICON } from '@app/core/data/svg-data';

import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { UserBadgeComponent } from '../../../../shared/components/user-badge/user-badge.component';

@Component({
  selector: 'app-profile',
  imports: [UserBadgeComponent, IconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  public bellIcon = BELL_ICON;
}
