import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AuthActions } from '@app/core/store/actions/auth.actions';

import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-dropdown.component.html',
  styleUrls: ['./profile-dropdown.component.scss'],
})
export class ProfileDropdownComponent {
  @Output() closeDropdown = new EventEmitter<void>();

  private userProfileService = inject(UserProfileService);
  private store = inject(Store);

  currentUser = this.userProfileService.currentUser;

  onLogout(): void {
    this.closeDropdown.emit();
    this.store.dispatch(AuthActions.logout());
  }
}
