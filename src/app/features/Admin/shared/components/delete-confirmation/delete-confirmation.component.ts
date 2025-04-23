import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NSP } from '../nsp-table/nsp-table.component';

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './delete-confirmation.component.html',
})
export class DeleteConfirmationComponent {
  @Input() nsp: NSP | null = null;
  @Input() showModal = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
