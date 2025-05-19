import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';

import { NotificationItem } from '../../models/notification.model';
import { AdminNotificationService } from '../../services/admin-notification.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss'],
})
export class NotificationDropdownComponent {
  @Output() closeDropdown = new EventEmitter<void>();

  private readonly notificationService = inject(AdminNotificationService);

  notifications$ = this.notificationService.notifications$;

  markAsRead(notification: NotificationItem): void {
    this.notificationService.markAsRead(notification.id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(event: Event, notificationId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.notificationService.removeNotification(notificationId);
  }
  getNotificationTypeIcon(type: string): string {
    switch (type) {
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getNotificationTypeClass(type: string): string {
    switch (type) {
      case 'info':
        return 'bg-blue-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
  }
}
