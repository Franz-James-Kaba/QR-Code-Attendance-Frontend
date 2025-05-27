import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BELL_ICON } from '@app/core/data/svg-data';
import { AuthService } from '@app/core/services/auth/auth.service';
import { AuthActions } from '@app/core/store/actions/auth.actions';
import { selectUser } from '@app/core/store/selectors/auth.selectors';
import { IconComponent } from '@app/shared/components/icon/icon.component';
import { UserBadgeComponent } from '@app/shared/components/user-badge/user-badge.component';
import { User } from '@app/shared/models/auth/auth.model';
import { Store } from '@ngrx/store';
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
export class ProfileComponent implements OnInit {
  public bellIcon = BELL_ICON;
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);
  public user$: Observable<User | null> = this.store.select(selectUser);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.store.dispatch(AuthActions.fetchUserProfile());
    }
  }
}
