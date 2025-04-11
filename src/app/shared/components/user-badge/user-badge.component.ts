import { CommonModule } from '@angular/common';
import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-badge.component.html',
  styleUrl: './user-badge.component.scss'
})
export class UserBadgeComponent {
  @Input() userName: string = 'User';
  @Input() userRole: string = 'Default Role';
  @Input() userAvatar: string = '';

  isDropdownOpen = false;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
