export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // Duration in milliseconds
  icon?: string; // Optional SVG icon
  autoClose?: boolean; // Whether to automatically close the notification
  showProgress?: boolean; // Whether to show a progress bar for auto-close
  title?: string; // Optional title for the notification
  actionLabel?: string; // Optional action button text
  onAction?: () => void; // Optional action callback
}

export interface NotificationOptions {
  duration?: number;
  icon?: string;
  autoClose?: boolean;
  showProgress?: boolean;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
}