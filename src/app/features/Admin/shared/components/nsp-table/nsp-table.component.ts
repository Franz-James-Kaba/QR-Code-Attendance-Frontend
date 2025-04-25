import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '@shared/components/button/button.component';

export interface NSP {
  id: string;
  name: string;
  stack: string;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Graduated';
  email?: string;
  phone?: string;
  program?: string;
  joinDate?: string;
}

@Component({
  selector: 'app-nsp-table',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './nsp-table.component.html',
})

export class NspTableComponent {
  @Input() nsps: NSP[] = [];
  @Input() showSuccessMessage = false;
  @Input() successMessage = '';

  @Output() edit = new EventEmitter<NSP>();
  @Output() delete = new EventEmitter<NSP>();
  @Output() create = new EventEmitter<void>();

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'Graduated':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onEdit(nsp: NSP): void {
    this.edit.emit(nsp);
  }

  onDelete(nsp: NSP): void {
    this.delete.emit(nsp);
  }

  onCreateNsp(): void {
    this.create.emit();
  }
}
