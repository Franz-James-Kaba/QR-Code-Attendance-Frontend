import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';

import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './profile-dropdown.component.html',
  styleUrls: ['./profile-dropdown.component.scss'],
})
export class ProfileDropdownComponent {
  @Output() closeDropdown = new EventEmitter<void>();

  private userProfileService = inject(UserProfileService);

  currentUser = this.userProfileService.currentUser;

  onLogout(): void {
    // In a real app, this would call the authentication service
    console.log('Logging out...');
    // Redirect to login page
    window.location.href = '/auth/login';
  }
}
