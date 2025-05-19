import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Notification, NotificationPosition } from '../../models/notification/notification.model';

import { NotificationItemComponent } from './notification-item/notification-item.component';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, NotificationItemComponent],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly notificationService = inject(NotificationService);

  notifications$: Observable<Notification[]> = this.notificationService.notifications;

  /** Position of the notifications container */
  @Input() set position(value: NotificationPosition) {
    this._position = value;
    this.updatePositionClass();
  }
  get position(): NotificationPosition {
    return this._position;
  }

  /** Maximum number of visible notifications */
  @Input() maxVisibleNotifications = 5;

  /** Theme for the notifications: 'light', 'dark', or 'system' */
  @Input() theme: 'light' | 'dark' | 'system' = 'system';

  private _position: NotificationPosition = 'top-right';
  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  @HostBinding('class') className = '';
  @HostBinding('attr.data-position') get dataPosition() {
    return this._position;
  }
  @HostBinding('class.light-theme') get isLightTheme() {
    return this.theme === 'light' || (this.theme === 'system' && !this.mediaQuery.matches);
  }
  @HostBinding('class.dark-theme') get isDarkTheme() {
    return this.theme === 'dark' || (this.theme === 'system' && this.mediaQuery.matches);
  }

  ngOnInit(): void {
    this.updatePositionClass();

    // Listen for system theme changes when using 'system' theme
    if (this.theme === 'system') {
      this.mediaQuery.addEventListener('change', this.handleThemeChange);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up event listener
    if (this.theme === 'system') {
      this.mediaQuery.removeEventListener('change', this.handleThemeChange);
    }
  }

  /**
   * Remove a notification
   */
  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  /**
   * Show all notifications if there are more than the visible limit
   */
  showAllNotifications(): void {
    // Temporarily increase the limit to show all notifications
    this.maxVisibleNotifications = 999;
    // Reset after 10 seconds
    setTimeout(() => {
      this.maxVisibleNotifications = 5;
    }, 10000);
  }

  /**
   * Update the position class based on the current position value
   */
  private updatePositionClass(): void {
    // Base positioning classes
    const positionClasses = {
      'top-right': 'fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm',
      'top-left': 'fixed top-4 left-4 z-50 flex flex-col gap-2 w-full max-w-sm',
      'bottom-right': 'fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 w-full max-w-sm',
      'bottom-left': 'fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-2 w-full max-w-sm',
      'top-center':
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm',
      'bottom-center':
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse gap-2 w-full max-w-sm',
    };

    this.className = positionClasses[this._position];
  }

  /**
   * Handle system theme changes
   */
  private readonly handleThemeChange = (/* event: MediaQueryListEvent */) => {
    // No need to manually update bindings, Angular will handle this
  };
}
