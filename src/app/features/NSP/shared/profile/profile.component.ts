import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BELL_ICON } from '@app/core/data/svg-data';
import { AuthService } from '@app/core/services/auth/auth.service';
import { IconComponent } from '@app/shared/components/icon/icon.component';
import { UserBadgeComponent } from '@app/shared/components/user-badge/user-badge.component';
import { ExtendedAuthResponse } from '@app/shared/models/auth/auth.model';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, UserBadgeComponent, IconComponent],
  template: `
    <div class="flex items-center justify-between py-2">
      @if (user$ | async; as user) {
        <app-user-badge
          [firstName]="user.firstName || ''"
          [lastName]="user.lastName || ''"
          [userRole]="user.role"
          [checkedIn]="user.checkedIn || false"
          [status]="user.checkedIn ? 'online' : 'offline'"
        />
      } @else {
        <p>Loading profile...</p>
      }
      <div>
        <button class="p-2">
          <app-icon
            [path]="bellIcon.path"
            [viewBox]="bellIcon.viewBox"
            [size]="bellIcon.size"
            strokeColor="nspText"
          />
        </button>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  public bellIcon = BELL_ICON;
  private readonly authService = inject(AuthService);
  public user$: Observable<ExtendedAuthResponse | null> = this.authService.currentUser$;
}
