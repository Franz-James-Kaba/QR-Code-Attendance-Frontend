import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-badge.component.html',
  styleUrl: './user-badge.component.scss'
})
export class UserBadgeComponent {
  @Input() userName: string = 'User';
  @Input() userRole: string = 'Default Role';
  @Input() userAvatar: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showRole: boolean = true;
  @Input() clickable: boolean = false;
  @Input() customClass: string = '';
  @Input() avatarOnly: boolean = false;
  @Input() status: 'online' | 'offline' | 'away' | 'busy' | 'none' = 'none';

  @Output() badgeClick = new EventEmitter<void>();

  get sizeClasses(): string {
    const sizes = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base'
    };
    return sizes[this.size];
  }

  get roleTextClass(): string {
    const sizes = {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm'
    };
    return sizes[this.size];
  }

  get nameTextClass(): string {
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };
    return sizes[this.size];
  }

  get statusClasses(): string {
    if (this.status === 'none') return '';

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500'
    };

    return statusColors[this.status];
  }

  onBadgeClick(): void {
    if (this.clickable) {
      this.badgeClick.emit();
    }
  }
}
