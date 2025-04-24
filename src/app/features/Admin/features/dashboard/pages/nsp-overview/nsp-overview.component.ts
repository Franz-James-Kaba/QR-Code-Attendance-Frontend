import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '@shared/components/button/button.component';

import { DeleteConfirmationComponent } from '../../../../shared/components/delete-confirmation/delete-confirmation.component';
import { ModalContainerComponent } from '../../../../shared/components/modal-container/modal-container.component';
import { NspTableComponent, NSP } from '../../../../shared/components/nsp-table/nsp-table.component';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-nsp-overview',
  standalone: true,
  imports: [CommonModule, ButtonComponent, NspTableComponent, DeleteConfirmationComponent, ModalContainerComponent],
  templateUrl: './nsp-overview.component.html',
  styleUrls: ['./nsp-overview.component.scss']
})
export class NspOverviewComponent implements OnInit {
  // Flag to control empty state or table view
  hasRecords = false;

  // Success message handling
  showSuccessMessage = false;
  successMessage = '';

  // Delete confirmation modal handling
  showDeleteModal = false;
  nspToDelete: NSP | null = null;

  // Mock data for the table view
  nsps: NSP[] = [];

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalService = inject(ModalService);

  ngOnInit(): void {
    // Check for success messages from redirects (after edit/create/delete)
    this.route.queryParams.subscribe(params => {
      if (params['success']) {
        this.showSuccessMessage = true;
        this.successMessage = params['message'] || 'Operation successful';
        // Hide success message after 5 seconds
        setTimeout(() => this.showSuccessMessage = false, 5000);
      }
    });

    // Load mock data for demonstration
    this.loadMockData();
  }

  loadMockData(): void {
    // For demonstration purposes: mock data
    // In a real application, this would fetch from a service
    this.nsps = [
      {
        id: 'NSP-1234',
        name: 'John Doe',
        stack: 'Frontend',
        status: 'Active',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8901',
        program: 'Web Development',
        joinDate: '2024-05-01'
      },
      {
        id: 'NSP-5678',
        name: 'Jane Smith',
        stack: 'Backend',
        status: 'Active',
        email: 'jane.smith@example.com',
        phone: '+1 234 567 8902',
        program: 'Data Science',
        joinDate: '2024-04-15'
      },
      {
        id: 'NSP-9012',
        name: 'David Johnson',
        stack: 'FullStack',
        status: 'On Leave',
        email: 'david.johnson@example.com',
        phone: '+1 234 567 8903',
        program: 'Web Development',
        joinDate: '2024-03-10'
      }
    ];

    // Update hasRecords flag
    this.hasRecords = this.nsps.length > 0;
  }

  // Methods for handling NSP actions using the shared modal service
  createNsp(): void {
    this.modalService.openModal('createNsp');
  }

  editNsp(nsp: NSP): void {
    this.modalService.openModal('editNsp', nsp);
  }

  // Delete confirmation methods
  confirmDelete(nsp: NSP): void {
    this.nspToDelete = nsp;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.nspToDelete = null;
  }

  executeDelete(): void {
    if (this.nspToDelete) {
      // In a real application, call a service to delete the NSP
      console.log('Deleting NSP:', this.nspToDelete.id);

      // Remove from local array for demonstration
      this.nsps = this.nsps.filter(nsp => nsp.id !== this.nspToDelete?.id);

      // Update empty state flag
      this.hasRecords = this.nsps.length > 0;

      // Show success message
      this.showSuccessMessage = true;
      this.successMessage = `${this.nspToDelete.name} has been successfully deleted`;

      // Hide success message after 5 seconds
      setTimeout(() => this.showSuccessMessage = false, 5000);

      // Close modal
      this.showDeleteModal = false;
      this.nspToDelete = null;
    }
  }
}
