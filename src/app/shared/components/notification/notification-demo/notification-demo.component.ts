import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@shared/components/notification/notification.service';
import { NotificationPosition } from '@shared/models/notification/notification.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notification-demo">
      <h2>Notification Component</h2>

      <div class="config-section">
        <h3>Configuration</h3>
        <div class="form-group">
          <label for="position">Position:</label>
          <select id="position" [(ngModel)]="position" (change)="updatePosition()">
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-center">Top Center</option>
            <option value="bottom-center">Bottom Center</option>
          </select>
        </div>

        <div class="form-group">
          <label for="theme">Theme:</label>
          <select id="theme" [(ngModel)]="theme" (change)="updateTheme()">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div class="form-group">
          <label for="duration">Duration (ms):</label>
          <input id="duration" type="number" [(ngModel)]="duration" min="1000" step="1000" />
        </div>
      </div>

      <div class="button-group">
        <h3>Test Notifications</h3>
        <button (click)="showSuccessNotification()">Success</button>
        <button (click)="showErrorNotification()">Error</button>
        <button (click)="showInfoNotification()">Info</button>
        <button (click)="showWarningNotification()">Warning</button>
        <button (click)="showWithTitleNotification()">With Title</button>
        <button (click)="showWithActionNotification()">With Action</button>
      </div>
    </div>
  `,
  styles: [
    `
      .notification-demo {
        padding: 20px;
        margin: 20px;
        border-radius: 8px;
        background-color: #f9fafb;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      h2 {
        margin-bottom: 16px;
        color: #111827;
      }

      h3 {
        margin: 16px 0 12px 0;
        color: #374151;
        font-size: 1.1rem;
      }

      .config-section {
        margin-bottom: 24px;
        padding: 16px;
        border-radius: 6px;
        background-color: #f3f4f6;
      }

      .form-group {
        margin-bottom: 12px;
        display: flex;
        align-items: center;
      }

      label {
        width: 120px;
        font-weight: 500;
      }

      select,
      input {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #d1d5db;
        background-color: #fff;
      }

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        flex-direction: column;
      }

      .button-group button {
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        background-color: #3b82f6;
        color: white;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        width: fit-content;
      }

      .button-group button:hover {
        background-color: #2563eb;
      }
    `,
  ],
})
export class NotificationDemoComponent {
  private notificationService = inject(NotificationService);

  // Configuration options
  position: NotificationPosition = 'top-right';
  theme: 'light' | 'dark' | 'system' = 'system';
  duration: number = 5000;

  // Reference to the global notification component in app.component.html
  private notificationComponent?: HTMLElement;

  ngOnInit() {
    // Find the notification component in the DOM
    setTimeout(() => {
      this.notificationComponent = document.querySelector('app-notification') as HTMLElement;
      this.updatePosition();
      this.updateTheme();
    });
  }

  updatePosition() {
    if (this.notificationComponent) {
      this.notificationComponent.setAttribute('ng-reflect-position', this.position);
    }
  }

  updateTheme() {
    if (this.notificationComponent) {
      this.notificationComponent.setAttribute('ng-reflect-theme', this.theme);
    }
  }

  showSuccessNotification(): void {
    this.notificationService.success('Operation completed successfully!', {
      duration: this.duration,
    });
  }

  showErrorNotification(): void {
    this.notificationService.error('An error occurred while processing your request.', {
      duration: this.duration,
    });
  }

  showInfoNotification(): void {
    this.notificationService.info('Your session will expire in 5 minutes.', {
      duration: this.duration,
    });
  }

  showWarningNotification(): void {
    this.notificationService.warning('Please save your changes before leaving.', {
      duration: this.duration,
    });
  }

  showWithTitleNotification(): void {
    this.notificationService.info('This is additional information about the feature.', {
      duration: this.duration,
      title: 'Did you know?',
    });
  }

  showWithActionNotification(): void {
    this.notificationService.warning('Your session is about to expire.', {
      duration: 15000, // Longer duration for action
      title: 'Session Expiring',
      actionLabel: 'Extend Session',
      onAction: () => {
        this.notificationService.success('Session extended successfully!');
      },
    });
  }
}
