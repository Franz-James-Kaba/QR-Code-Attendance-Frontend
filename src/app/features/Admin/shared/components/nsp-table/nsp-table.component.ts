import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface NSP {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role?: string;
  passwordResetRequired?: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-nsp-table',
  standalone: true,
  imports: [CommonModule ],
  templateUrl: './nsp-table.component.html',
})
export class NspTableComponent {
  @Input() nsps: NSP[] = [];

  @Output() edit = new EventEmitter<NSP>();
  @Output() delete = new EventEmitter<NSP>();
  @Output() create = new EventEmitter<void>();

  getFullName(nsp: NSP): string {
    return `${nsp.firstName} ${nsp.middleName ? nsp.middleName + ' ' : ''}${nsp.lastName}`;
  }

  getInitials(nsp: NSP): string {
    return `${nsp.firstName.charAt(0)}${nsp.lastName.charAt(0)}`;
  }

  onEdit(nsp: NSP): void {
    this.edit.emit(nsp);
  }

  onDelete(nsp: NSP): void {
    this.delete.emit(nsp);
  }
}
