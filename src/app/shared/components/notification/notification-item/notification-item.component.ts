import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';

import { Notification } from '../../../models/notification/notification.model';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
})
export class NotificationItemComponent implements OnInit, OnDestroy {
  @Input() notification!: Notification;
  @Output() remove = new EventEmitter<void>();

  progressWidth = '100%';
  isRemoving = false;
  private animationFrameId?: number;
  private startTime?: number;

  ngOnInit(): void {
    // If notification has a duration and show progress is true, start progress bar
    if (this.notification.duration && this.notification.showProgress) {
      this.startProgressBar();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Close the notification with animation
   */
  close(): void {
    this.isRemoving = true;

    // Wait for animation to complete before removing
    setTimeout(() => {
      this.remove.emit();
    }, 300); // Match animation duration
  }

  /**
   * Handle the action button click
   */
  handleAction(): void {
    if (this.notification.onAction) {
      this.notification.onAction();
    }
  }

  /**
   * Get the icon path based on notification type
   */
  getIconPath(): string {
    if (this.notification.icon) {
      return this.notification.icon;
    }

    switch (this.notification.type) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0';
    }
  }

  /**
   * Get the CSS class based on notification type
   */
  get typeClass(): string {
    const baseClass = this.notification.type;
    return this.isRemoving ? `${baseClass} removing` : baseClass;
  }

  /**
   * Start the progress bar animation for auto-close notifications
   */
  private startProgressBar(): void {
    if (!this.notification.duration) return;

    this.startTime = performance.now();
    const duration = this.notification.duration;

    const updateProgress = (timestamp: number) => {
      if (!this.startTime) return;

      const elapsedTime = timestamp - this.startTime;
      const remainingTime = Math.max(0, duration - elapsedTime);
      this.progressWidth = `${(remainingTime / duration) * 100}%`;

      if (remainingTime > 0) {
        this.animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        // Time is up, start removal animation
        this.close();
      }
    };

    this.animationFrameId = requestAnimationFrame(updateProgress);
  }
}
