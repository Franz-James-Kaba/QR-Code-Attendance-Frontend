import { FacilitatorDeleteConfirmationComponent } from '@Admin/shared/components/facilitator-delete-confirmation/facilitator-delete-confirmation.component';
import { FacilitatorTableComponent } from '@Admin/shared/components/facilitator-table/facilitator-table.component';
import { ModalContainerComponent } from '@Admin/shared/components/modal-container/modal-container.component';
import { FacilitatorViewModel } from '@Admin/shared/models/facilitator.model';
import { FacilitatorService } from '@Admin/shared/services/facilitator.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '@app/features/Admin/core/services/modal.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NotificationService } from '@shared/components/notification/notification.service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-facilitator-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    FacilitatorTableComponent,
    FacilitatorDeleteConfirmationComponent,
    ModalContainerComponent,
  ],
  templateUrl: './facilitator-overview.component.html',
})
export class FacilitatorOverviewComponent implements OnInit {
  hasRecords = false;
  showDeleteModal = false;
  facilitatorToDelete: FacilitatorViewModel | null = null;
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  isLoading = false;
  facilitators: FacilitatorViewModel[] = [];
  allFacilitators: FacilitatorViewModel[] = [];
  searchQuery = '';

  private readonly route = inject(ActivatedRoute);
  private readonly modalService = inject(ModalService);
  private readonly facilitatorService = inject(FacilitatorService);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    // Reset pagination to defaults
    this.currentPage = 0;
    this.pageSize = 10;

    // Check for success messages from redirects (after edit/create/delete)
    this.route.queryParams.subscribe(params => {
      if (params['success']) {
        this.showNotification('success', params['message'] ?? 'Operation successful');
      }
    });

    // Load facilitators from service
    this.loadFacilitators();
  }

  // Load facilitators from API with pagination
  loadFacilitators(): void {
    this.isLoading = true;

    this.facilitatorService
      .getAllFacilitators(this.currentPage, this.pageSize)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: result => {
          this.facilitators = result.data;
          this.totalItems = result.total;
          this.hasRecords = this.facilitators.length > 0;
          this.allFacilitators = result.data; // Store all facilitators for search
        },
        error: error => {
          console.error('Error loading facilitators:', error);
          this.showNotification('error', 'Failed to load facilitator data: ' + error.message);
        },
      });
  }

  createFacilitator(): void {
    this.modalService.openModal('createFacilitator');
  }

  editFacilitator(facilitator: FacilitatorViewModel): void {
    this.modalService.openModal('editFacilitator', facilitator);
  }

  confirmDelete(facilitator: FacilitatorViewModel): void {
    this.facilitatorToDelete = facilitator;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.facilitatorToDelete = null;
  }

  executeDelete(): void {
    if (this.facilitatorToDelete) {
      const facilitatorId = parseInt(this.facilitatorToDelete.id);
      if (isNaN(facilitatorId)) {
        this.showNotification('error', 'Invalid Facilitator ID');
        return;
      }

      this.isLoading = true;

      this.facilitatorService
        .deleteFacilitator(facilitatorId)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            const fullName = this.getFullName(this.facilitatorToDelete!);
            this.showNotification('success', `${fullName} has been successfully deleted`);

            this.loadFacilitators();

            this.showDeleteModal = false;
            this.facilitatorToDelete = null;
          },
          error: error => {
            console.error('Error deleting facilitator:', error);
            this.showNotification('error', 'Failed to delete facilitator: ' + error.message);
          },
        });
    }  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadFacilitators();
  }
  /**
   * Handle search query change
   */
  onSearch(): void {
    if (!this.searchQuery.trim()) {
      // If search is empty, restore all facilitators
      this.facilitators = [...this.allFacilitators];
    } else {
      // Filter facilitators based on search query
      const query = this.searchQuery.toLowerCase().trim();
      this.facilitators = this.allFacilitators.filter(
        facilitator => 
          facilitator.firstName.toLowerCase().includes(query) ||
          facilitator.lastName.toLowerCase().includes(query) ||
          facilitator.email.toLowerCase().includes(query) ||
          (facilitator.middleName && facilitator.middleName.toLowerCase().includes(query)) ||
          (facilitator.program && facilitator.program.toLowerCase().includes(query))
      );
    }
    
    // Update hasRecords flag
    this.hasRecords = this.facilitators.length > 0;
  }

  private getFullName(facilitator: FacilitatorViewModel): string {
    return `${facilitator.firstName} ${facilitator.middleName ? facilitator.middleName + ' ' : ''}${facilitator.lastName}`;
  }

  private showNotification(
    type: 'success' | 'error' | 'info',
    message: string,
    duration = 5000
  ): void {
    switch (type) {
      case 'success':
        this.notificationService.success(message, { duration });
        break;
      case 'error':
        this.notificationService.error(message, { duration });
        break;
      case 'info':
        this.notificationService.info(message, { duration });
        break;
      default:
        this.notificationService.info(message, { duration });
    }
  }
}
