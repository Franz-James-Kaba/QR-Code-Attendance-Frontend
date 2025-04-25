import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Notification } from '../../../models/notification/notification.model';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
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
    // Optional: close the notification after action if needed
    // this.close();
  }
  
  /**
   * Get the icon based on notification type
   */
  get icon(): string {
    if (this.notification.icon) {
      return this.notification.icon;
    }
    
    switch (this.notification.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'x-circle';
      case 'warning':
        return 'alert-triangle';
      case 'info':
        return 'info';
      default:
        return 'bell';
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