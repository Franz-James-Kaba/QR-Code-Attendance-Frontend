import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="[
        avatarOnly ? '' : 'flex items-center gap-2',
        clickable ? 'cursor-pointer' : '',
        customClass,
      ]"
      (click)="onBadgeClick()"
    >
      <div class="relative">
        <!-- Avatar image or initials fallback -->
        <div
          [ngClass]="[
            sizeClasses,
            'rounded-full flex items-center justify-center overflow-hidden',
          ]"
        >
          @if (avatarSrc) {
            <img
              [src]="avatarSrc"
              [alt]="firstName + ' ' + lastName + ' avatar'"
              class="w-full h-full object-cover"
            />
          } @else {
            <div class="w-full h-full bg-primary flex items-center justify-center text-white font-semibold">
              {{ initials }}
            </div>
          }
        </div>
        @if (status !== 'none') {
          <span
            [ngClass]="[
              statusClasses,
              'absolute bottom-0 right-0 block rounded-full border-2 border-white',
            ]"
            [style.width.px]="size === 'sm' ? 8 : size === 'md' ? 10 : 12"
            [style.height.px]="size === 'sm' ? 8 : size === 'md' ? 10 : 12"
            aria-hidden="true"
          ></span>
        }
      </div>
      @if (!avatarOnly) {
        <div class="text-left">
          <div [ngClass]="nameTextClass" class="font-medium text-gray-900">
            {{ firstName }} {{ lastName }}
          </div>
          @if (showRole) {
            <div [ngClass]="roleTextClass" class="text-gray-500">{{ userRole }}</div>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./user-badge.component.scss'],
})
export class UserBadgeComponent {
  @Input() firstName: string = 'User';
  @Input() lastName: string = '';
  @Input() userRole: string = 'Default Role';
  @Input() checkedIn: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showRole: boolean = true;
  @Input() avatarSrc: string = '';
  @Input() clickable: boolean = false;
  @Input() customClass: string = '';
  @Input() avatarOnly: boolean = false;
  @Input() status: 'online' | 'offline' | 'away' | 'busy' | 'none' = 'none';

  @Output() badgeClick = new EventEmitter<void>();

  public get initials(): string {
    const firstInitial = this.firstName ? this.firstName.charAt(0).toUpperCase() : '';
    const lastInitial = this.lastName ? this.lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }

  public get sizeClasses(): string {
    const sizes = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base',
    };
    return sizes[this.size];
  }

  public get roleTextClass(): string {
    const sizes = {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
    };
    return sizes[this.size];
  }

  public get nameTextClass(): string {
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };
    return sizes[this.size];
  }

  public get statusClasses(): string {
    if (this.status === 'none') return '';
    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };
    return statusColors[this.status];
  }

  public onBadgeClick(): void {
    if (this.clickable) {
      this.badgeClick.emit();
    }
  }
}
