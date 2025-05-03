import { BreadcrumbService, BreadcrumbItem } from '@Admin/services/breadcrumb.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { UserBadgeComponent } from '@shared/components/user-badge/user-badge.component';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbComponent,
    IconComponent,
    UserBadgeComponent,
    ClickOutsideDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Input() sidebarOpen: boolean = true;
  @Input() sidebarMinimized: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly breadcrumbService = inject(BreadcrumbService);

  isScrolled = false;
  hasNotifications = false;
  showUserDropdown = false;

  get breadcrumbs(): BreadcrumbItem[] {
    // Use the service's readonly signal
    return this.breadcrumbService.breadcrumbs();
  }

  readonly BELL_ICON_PATH = 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0';
  readonly MENU_ICON_PATH = 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5';

  ngOnInit(): void {
    this.checkNotifications();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onUserBadgeClick(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  onUserBadgeKeyDown(event: KeyboardEvent): void {
    // Toggle dropdown when Enter or Space is pressed
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.showUserDropdown = !this.showUserDropdown;
    }
  }

  onClickOutside(): void {
    if (this.showUserDropdown) {
      this.showUserDropdown = false;
    }
  }

  private checkNotifications(): void {
    this.hasNotifications = true;
  }
}
