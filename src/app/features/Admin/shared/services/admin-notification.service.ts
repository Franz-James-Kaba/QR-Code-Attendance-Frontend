import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { NotificationItem } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class AdminNotificationService {
  private readonly notifications = new BehaviorSubject<NotificationItem[]>([]);
  notifications$ = this.notifications.asObservable();

  // Using signals for Angular components that prefer signals
  private readonly notificationsSignal = signal<NotificationItem[]>([]);
  readonly currentNotifications = this.notificationsSignal.asReadonly();

  // Unread count
  private readonly unreadCountSignal = signal<number>(0);
  readonly unreadCount = this.unreadCountSignal.asReadonly();

  constructor() {
    // Add some mock notifications for demo purposes
    this.addMockNotifications();
  }

  // Add a new notification
  addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): void {
    const newNotification: NotificationItem = {
      id: this.generateRandomId(),
      ...notification,
      timestamp: new Date(),
      isRead: false,
    };

    const currentNotifications = this.notifications.getValue();
    const updatedNotifications = [newNotification, ...currentNotifications];

    this.notifications.next(updatedNotifications);
    this.notificationsSignal.set(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  // Mark a notification as read
  markAsRead(id: string): void {
    const currentNotifications = this.notifications.getValue();
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    );

    this.notifications.next(updatedNotifications);
    this.notificationsSignal.set(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    const currentNotifications = this.notifications.getValue();
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      isRead: true,
    }));

    this.notifications.next(updatedNotifications);
    this.notificationsSignal.set(updatedNotifications);
    this.unreadCountSignal.set(0);
  }

  // Remove a notification
  removeNotification(id: string): void {
    const currentNotifications = this.notifications.getValue();
    const updatedNotifications = currentNotifications.filter(
      notification => notification.id !== id
    );

    this.notifications.next(updatedNotifications);
    this.notificationsSignal.set(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  // Update unread count
  private updateUnreadCount(notifications: NotificationItem[]): void {
    const count = notifications.filter(notification => !notification.isRead).length;
    this.unreadCountSignal.set(count);
  }

  // Add some mock notifications for demo purposes
  private addMockNotifications(): void {
    const mockNotifications: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>[] = [
      {
        title: 'New NSP Registered',
        message: 'New NSP John Doe has registered for the program.',
        type: 'info',
        link: '/admin/nsps',
      },
      {
        title: 'Attendance Report Available',
        message: 'Weekly attendance report for Week 12 is now available.',
        type: 'success',
        link: '/admin/reports',
      },
      {
        title: 'System Update',
        message: 'System will undergo maintenance at 11:00 PM today.',
        type: 'warning',
      },
    ];

    // Add mock notifications with decreasing timestamps
    mockNotifications.forEach((notification, index) => {
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - index);

      const newNotification: NotificationItem = {
        id: this.generateRandomId(),
        ...notification,
        timestamp,
        isRead: false,
      };

      const currentNotifications = this.notifications.getValue();
      const updatedNotifications = [...currentNotifications, newNotification];

      this.notifications.next(updatedNotifications);
      this.notificationsSignal.set(updatedNotifications);
    });

    this.updateUnreadCount(this.notifications.getValue());
  }

  // Generate a random ID
  private generateRandomId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }
}
