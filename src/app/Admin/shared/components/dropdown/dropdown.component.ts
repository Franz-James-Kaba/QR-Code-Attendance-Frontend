import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from "../icon/icon.component";

interface DropdownItem {
  label: string;
  icon: string;
  action?: () => void;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  @Input() label = '';
  @Input() items: DropdownItem[] = [];
  @Input() showAvatar = false;
  @Input() avatarUrl = '';
  @Output() itemClick = new EventEmitter<DropdownItem>();

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  onItemClick(item: DropdownItem): void {
    this.isOpen = false;
    this.itemClick.emit(item);
    if (item.action) {
      item.action();
    }
  }
}
