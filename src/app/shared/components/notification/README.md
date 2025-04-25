# Notification Component

A customizable, accessible notification system for displaying success, error, warning, and information messages throughout the application.

## Features

- Four notification types: success, error, warning, info
- Configurable position (top-right, top-left, top-center, bottom-right, bottom-left, bottom-center)
- Automatically closes after a configurable duration
- Progress bar to indicate when notification will close
- Dark/light/system theme support
- Accessible with proper ARIA attributes
- Smooth animations for entry and exit
- Support for titles and action buttons
- HTTP interceptor for automatic API response notifications
- Limit for maximum visible notifications

## Basic Usage

The notification component is globally registered in the app component, so you can use the `NotificationService` in any component:

```typescript
import { Component, inject } from '@angular/core';
import { NotificationService } from '@shared/components/notification/notification.service';

@Component({...})
export class MyComponent {
  private notificationService = inject(NotificationService);
  
  showSuccess() {
    this.notificationService.success('Operation completed successfully!');
  }
  
  showError() {
    this.notificationService.error('An error occurred while processing your request.');
  }
  
  showInfo() {
    this.notificationService.info('This is some useful information.');
  }
  
  showWarning() {
    this.notificationService.warning('Please be careful with this action.');
  }
}
```

## Advanced Usage

### Custom Options

All notification methods accept an optional options object:

```typescript
this.notificationService.success('Record created successfully!', {
  duration: 8000, // 8 seconds
  autoClose: true,
  showProgress: true,
  title: 'Success',
  actionLabel: 'View',
  onAction: () => {
    // Do something when action button is clicked
  }
});
```

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| duration | number | 5000 | Duration in milliseconds before auto-close |
| autoClose | boolean | true | Whether to automatically close the notification |
| showProgress | boolean | true | Whether to show the progress bar for auto-close |
| title | string | - | Optional title for the notification |
| actionLabel | string | - | Optional action button text |
| onAction | function | - | Callback function when action button is clicked |
| icon | string | - | Custom icon (defaults based on notification type) |

### Customizing the Global Notification Component

You can customize the global notification component by setting attributes on it in your app component template:

```html
<app-notification 
  position="top-right" 
  theme="system" 
  [maxVisibleNotifications]="5">
</app-notification>
```

### Available Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| position | NotificationPosition | 'top-right' | Position of notifications on screen |
| theme | 'light' \| 'dark' \| 'system' | 'system' | Theme for notifications |
| maxVisibleNotifications | number | 5 | Maximum number of visible notifications |

## HTTP Interceptor

The notification system includes an HTTP interceptor that automatically shows success and error notifications for API responses.

By default, it:
- Shows success notifications for POST, PUT, PATCH, DELETE requests
- Shows error notifications for all failed requests
- Skips notifications for GET requests

You can customize this behavior in the `NotificationInterceptor` class.

## Demo Component

A demo component is included to test all notification features:

```typescript
// In a route configuration
{
  path: 'notification-demo',
  loadComponent: () => import('@shared/components/notification/notification-demo/notification-demo.component')
    .then(m => m.NotificationDemoComponent)
}
```