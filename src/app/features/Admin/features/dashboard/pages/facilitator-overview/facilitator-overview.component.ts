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

interface FacilitatorParams {
  page: number;
  pageSize: number;
  search?: string;
}

interface FacilitatorsResponse {
  data: FacilitatorViewModel[];
  total: number;
}

interface ModalData {
  type: string;
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

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
  isCreatingFacilitator = false;
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

    // Subscribe to modal changes to refresh data
    this.modalService.modalClosed.subscribe(() => {
      const lastModalType = this.modalService.getModalType();
      if (lastModalType === 'createFacilitator') {
        this.showNotification('success', 'Facilitator created successfully');
        this.loadFacilitators();
        this.isCreatingFacilitator = false;
      } else if (lastModalType === 'editFacilitator') {
        this.showNotification('success', 'Facilitator updated successfully');
        this.loadFacilitators();
      }
    });

    this.loadFacilitators();
  }

  /**
   * Load facilitators with optional search and pagination
   */
  private loadFacilitators(): void {
    this.isLoading = true;
    const params: FacilitatorParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.facilitatorService
      .getAllFacilitators(this.currentPage)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result: FacilitatorsResponse) => {
          this.facilitators = result.data;
          this.totalItems = result.total;
          this.hasRecords = this.facilitators.length > 0;
          this.allFacilitators = result.data;
        },
        error: (error: Error) => {
          console.error('Error loading facilitators:', error);
          this.showNotification('error', 'Failed to load facilitators');
        },
      });
  }

  /**
   * Open modal to create a new facilitator
   */
  createFacilitator(): void {
    this.isCreatingFacilitator = true;
    this.modalService.openModal('createFacilitator', null);
  }

  /**
   * Open modal to edit an existing facilitator
   */
  editFacilitator(facilitator: FacilitatorViewModel): void {
    const modalData: ModalData = {
      type: 'facilitator',
      data: facilitator,
    };
    this.modalService.openModal('editFacilitator', modalData);
  }

  /**
   * Handle search input changes
   */
  onSearch(): void {
    this.currentPage = 0; // Reset to first page on search
    this.loadFacilitators();
  }

  /**
   * Show delete confirmation dialog
   */
  confirmDelete(facilitator: FacilitatorViewModel): void {
    this.facilitatorToDelete = facilitator;
    this.showDeleteModal = true;
  }

  /**
   * Cancel delete operation
   */
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.facilitatorToDelete = null;
  }

  /**
   * Execute delete operation
   */
  executeDelete(): void {
    if (!this.facilitatorToDelete?.id) return;

    const facilitatorId = parseInt(this.facilitatorToDelete.id);
    this.facilitatorService.deleteFacilitator(facilitatorId).subscribe({
      next: () => {
        this.showNotification('success', 'Facilitator deleted successfully');
        this.loadFacilitators();
      },
      error: (error: Error) => {
        console.error('Error deleting facilitator:', error);
        this.showNotification('error', 'Failed to delete facilitator');
      },
      complete: () => {
        this.showDeleteModal = false;
        this.facilitatorToDelete = null;
      },
    });
  }

  /**
   * Handle page changes
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadFacilitators();
  }

  /**
   * Show a notification message
   */
  private showNotification(type: 'success' | 'error' | 'info', message: string): void {
    const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
    const duration = 3000; // Short duration for snappy feedback

    switch (type) {
      case 'success':
        this.notificationService?.success(formattedMessage, { duration });
        break;
      case 'error':
        this.notificationService?.error(formattedMessage, { duration });
        break;
      case 'info':
        this.notificationService?.info(formattedMessage, { duration });
        break;
    }
  }
}
