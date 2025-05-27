import { BreadcrumbService } from '@Admin/core/services/breadcrumb.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { UserBadgeComponent } from '@shared/components/user-badge/user-badge.component';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';
import { BreadcrumbItem } from '@shared/models/breadcrumb.model';

import { AdminNotificationService } from '../../services/admin-notification.service';
import { UserProfileService } from '../../services/user-profile.service';
import { NotificationDropdownComponent } from '../notification-dropdown/notification-dropdown.component';
import { ProfileDropdownComponent } from '../profile-dropdown/profile-dropdown.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbComponent,
    UserBadgeComponent,
    ClickOutsideDirective,
    NotificationDropdownComponent,
    ProfileDropdownComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @Input() sidebarOpen: boolean = true;
  @Input() sidebarMinimized: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly notificationService = inject(AdminNotificationService);
  private readonly userProfileService = inject(UserProfileService);

  isScrolled = false;
  showUserDropdown = false;
  showNotificationDropdown = false;
  get breadcrumbs(): BreadcrumbItem[] {
    const items = this.breadcrumbService.breadcrumbs().map(item => ({
      label: item.label,
      url: item.link ?? '',
    }));

    const seen = new Set();
    return items.filter(item => {
      const duplicate = seen.has(item.label);
      seen.add(item.label);
      return !duplicate;
    });
  }

  get unreadCount(): number {
    return this.notificationService.unreadCount();
  }

  get currentUser() {
    return this.userProfileService.currentUser;
  }
  readonly BELL_ICON_PATH =
    'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0';
  readonly MENU_ICON_PATH = 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5';

  // Icon paths for the profile dropdown
  readonly PROFILE_ICON_PATH =
    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
  readonly SETTINGS_ICON_PATH =
    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
  readonly SETTINGS_INNER_ICON_PATH = 'M15 12a3 3 0 11-6 0 3 3 0 016 0z';
  readonly LOGOUT_ICON_PATH =
    'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1';
  readonly ACTIVITY_ICON_PATH =
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';

  // Icon paths for notifications
  readonly NOTIFICATION_SUCCESS_ICON = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
  readonly NOTIFICATION_INFO_ICON = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  readonly NOTIFICATION_WARNING_ICON =
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
  readonly NOTIFICATION_ERROR_ICON =
    'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
  ngOnInit(): void {
    // No additional initialization needed
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onUserBadgeClick(): void {
    if (this.showNotificationDropdown) {
      this.showNotificationDropdown = false;
    }
    this.showUserDropdown = !this.showUserDropdown;
  }

  onToggleNotifications(): void {
    if (this.showUserDropdown) {
      this.showUserDropdown = false;
    }
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  onUserBadgeKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.showUserDropdown = !this.showUserDropdown;
    }
  }

  getUserFirstName(): string {
    const fullName = this.currentUser().name || '';
    const nameParts = fullName.split(' ');
    return nameParts[0] || 'User';
  }

  getUserLastName(): string {
    const fullName = this.currentUser().name || '';
    const nameParts = fullName.split(' ');
    return nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  }

  onClickOutside(): void {
    if (this.showUserDropdown) {
      this.showUserDropdown = false;
    }
    if (this.showNotificationDropdown) {
      this.showNotificationDropdown = false;
    }
  }
}
