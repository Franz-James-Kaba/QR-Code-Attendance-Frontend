import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '@shared/components/button/button.component';

import { FacilitatorViewModel } from '../../models/facilitator.model';

@Component({
  selector: 'app-facilitator-delete-confirmation',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './facilitator-delete-confirmation.component.html',
})
export class FacilitatorDeleteConfirmationComponent {
  @Input() showModal = false;
  @Input() facilitator: FacilitatorViewModel | null = null;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getFullName(): string {
    if (!this.facilitator) {
      return '';
    }
    
    return `${this.facilitator.firstName} ${this.facilitator.middleName ? this.facilitator.middleName + ' ' : ''}${this.facilitator.lastName}`;
  }
}