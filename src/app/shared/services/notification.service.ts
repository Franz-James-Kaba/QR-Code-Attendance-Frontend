import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private defaultDuration = 5000; // 5 seconds

  constructor() {}

  /**
   * Get all active notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  /**
   * Show a success notification
   */
  success(message: string, duration?: number): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      message,
      duration: duration || this.defaultDuration,
    });
  }

  /**
   * Show an error notification
   */
  error(message: string, duration?: number): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      message,
      duration: duration || this.defaultDuration,
    });
  }

  /**
   * Show an info notification
   */
  info(message: string, duration?: number): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      message,
      duration: duration || this.defaultDuration,
    });
  }

  /**
   * Show a warning notification
   */
  warning(message: string, duration?: number): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      message,
      duration: duration || this.defaultDuration,
    });
  }

  /**
   * Remove a notification by ID
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next(
      currentNotifications.filter((notification) => notification.id !== id)
    );
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.next([]);
  }

  /**
   * Add a notification to the notification list
   */
  private addNotification(notification: Notification): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    // Auto dismiss after duration
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Generate a unique ID for the notification
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
