import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FacilitatorViewModel } from '../../models/facilitator.model';

@Component({
  selector: 'app-facilitator-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facilitator-table.component.html',
})
export class FacilitatorTableComponent {
  @Input() facilitators: FacilitatorViewModel[] = [];

  @Output() edit = new EventEmitter<FacilitatorViewModel>();
  @Output() delete = new EventEmitter<FacilitatorViewModel>();
  @Output() togglePrivilege = new EventEmitter<{
    facilitator: FacilitatorViewModel;
    grant: boolean;
  }>();
  @Output() create = new EventEmitter<void>();

  getFullName(facilitator: FacilitatorViewModel): string {
    return `${facilitator.firstName} ${facilitator.middleName ? facilitator.middleName + ' ' : ''}${facilitator.lastName}`;
  }

  getInitials(facilitator: FacilitatorViewModel): string {
    return `${facilitator.firstName.charAt(0)}${facilitator.lastName.charAt(0)}`;
  }

  onEdit(facilitator: FacilitatorViewModel): void {
    this.edit.emit(facilitator);
  }

  onDelete(facilitator: FacilitatorViewModel): void {
    this.delete.emit(facilitator);
  }

  onToggleReceptionPrivilege(facilitator: FacilitatorViewModel, grant: boolean): void {
    this.togglePrivilege.emit({ facilitator, grant });
  }
}
