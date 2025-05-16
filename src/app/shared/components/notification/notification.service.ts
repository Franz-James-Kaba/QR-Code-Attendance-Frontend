import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Notification,
  NotificationOptions,
  NotificationType,
} from '../../models/notification/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly defaultOptions: NotificationOptions = {
    duration: 5000, // 5 seconds
    autoClose: true,
    showProgress: true,
  };

  private notifications$ = new BehaviorSubject<Notification[]>([]);

  // Public observable that components can subscribe to
  public notifications: Observable<Notification[]> = this.notifications$.asObservable();

  /**
   * Show a success notification
   * @param message Message to display
   * @param options Optional configurations
   */
  success(message: string, options?: NotificationOptions): string {
    return this.addNotification('success', message, options);
  }

  /**
   * Show an error notification
   * @param message Message to display
   * @param options Optional configurations
   */
  error(message: string, options?: NotificationOptions): string {
    return this.addNotification('error', message, {
      ...options,
      duration: options?.duration || 8000, // Errors stay longer by default
    });
  }

  /**
   * Show an info notification
   * @param message Message to display
   * @param options Optional configurations
   */
  info(message: string, options?: NotificationOptions): string {
    return this.addNotification('info', message, options);
  }

  /**
   * Show a warning notification
   * @param message Message to display
   * @param options Optional configurations
   */
  warning(message: string, options?: NotificationOptions): string {
    return this.addNotification('warning', message, options);
  }

  /**
   * Remove a notification by ID
   * @param id Notification ID to remove
   */
  remove(id: string): void {
    const currentNotifications = this.notifications$.value;
    this.notifications$.next(currentNotifications.filter(notification => notification.id !== id));
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications$.next([]);
  }

  /**
   * Add a notification to the notifications array
   */
  private addNotification(
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ): string {
    const id = this.generateId();
    const notification: Notification = {
      id,
      type,
      message,
      ...this.defaultOptions,
      ...options,
    };

    // Add new notification to the array
    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, notification]);

    // Set up auto-close if enabled
    if (notification.autoClose && notification.duration) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  /**
   * Generate a unique ID for the notification
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
