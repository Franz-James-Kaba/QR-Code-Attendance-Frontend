import { ModalService } from '@Admin/app/shared/services/modal.service';
import { ModalContainerComponent } from '@Admin/shared/components/modal-container/modal-container.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ButtonComponent } from '@shared/components/button/button.component';

interface Facilitator {
  id: number;
  name: string;
  email: string;
  program: string;
  status: string;
}

@Component({
  selector: 'app-facilitator-overview',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalContainerComponent],
  templateUrl: './facilitator-overview.component.html',
  styleUrls: ['./facilitator-overview.component.scss']
})
export class FacilitatorOverviewComponent implements OnInit {
  // Mock data for facilitators (in a real app, this would come from a service)
  facilitators = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', program: 'Web Development', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', program: 'Data Science', status: 'Active' },
    { id: 3, name: 'Mark Johnson', email: 'mark.johnson@example.com', program: 'UI/UX Design', status: 'Inactive' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@example.com', program: 'Cloud Computing', status: 'Active' },
    { id: 5, name: 'David Miller', email: 'david.miller@example.com', program: 'Mobile Development', status: 'Active' },
  ];

  // Inject services
  private readonly modalService = inject(ModalService);

  ngOnInit(): void {
    // Any initialization logic can go here
  }

  /**
   * Opens the create facilitator modal
   */
  onCreateFacilitator(): void {
    this.modalService.openModal('createFacilitator');
  }

  /**
   * Opens the edit facilitator modal
   */
  onEditFacilitator(facilitator: Facilitator): void {
    this.modalService.openModal('editFacilitator', facilitator);
  }

  /**
   * Handles facilitator deletion
   */
  onDeleteFacilitator(id: number): void {
    // In a real app, you would call an API to delete the facilitator
    // For now, just filter out the deleted facilitator
    if (confirm('Are you sure you want to delete this facilitator?')) {
      this.facilitators = this.facilitators.filter(facilitator => facilitator.id !== id);
    }
  }
}
