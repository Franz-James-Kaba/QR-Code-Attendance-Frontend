import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NotificationService } from '@shared/components/notification/notification.service';
import { finalize } from 'rxjs';

import { ModalService } from '@app/features/Admin/core/services/modal.service';
import { FacilitatorDeleteConfirmationComponent } from '../../../../shared/components/facilitator-delete-confirmation/facilitator-delete-confirmation.component';
import { FacilitatorTableComponent } from '../../../../shared/components/facilitator-table/facilitator-table.component';
import { ModalContainerComponent } from '../../../../shared/components/modal-container/modal-container.component';
import { FacilitatorViewModel, mapToApiModel } from '../../../../shared/models/facilitator.model';
import { FacilitatorService } from '../../../../shared/services/facilitator.service';

@Component({
  selector: 'app-facilitator-overview',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonComponent, 
    FacilitatorTableComponent,
    FacilitatorDeleteConfirmationComponent,
    ModalContainerComponent
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
    
    this.facilitatorService.getAllFacilitators(this.currentPage, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (result) => {
          console.log('Received facilitators data:', result);
          this.facilitators = result.data;
          this.totalItems = result.total;

          // Update UI state
          this.hasRecords = this.facilitators.length > 0;
          console.log('Has records:', this.hasRecords, 'Facilitator count:', this.facilitators.length);
        },
        error: (error) => {
          console.error('Error loading facilitators:', error);
          this.showNotification('error', 'Failed to load facilitator data: ' + error.message);
        }
      });
  }

  // Methods for handling facilitator actions using the shared modal service
  createFacilitator(): void {
    this.modalService.openModal('createFacilitator');
  }

  editFacilitator(facilitator: FacilitatorViewModel): void {
    this.modalService.openModal('editFacilitator', facilitator);
  }

  // Delete confirmation methods
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

      this.facilitatorService.deleteFacilitator(facilitatorId)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            // Show success message
            const fullName = this.getFullName(this.facilitatorToDelete!);
            this.showNotification('success', `${fullName} has been successfully deleted`);
            
            // Reload the facilitator list
            this.loadFacilitators();

            // Close modal
            this.showDeleteModal = false;
            this.facilitatorToDelete = null;
          },
          error: (error) => {
            console.error('Error deleting facilitator:', error);
            this.showNotification('error', 'Failed to delete facilitator: ' + error.message);
          }
        });
    }
  }

  // Handle reception privilege toggle
  toggleReceptionPrivilege(event: { facilitator: FacilitatorViewModel; grant: boolean }): void {
    const { facilitator, grant } = event;
    const facilitatorName = this.getFullName(facilitator);
    const actionText = grant ? 'grant' : 'revoke';
    
    this.isLoading = true;
    
    // Call the appropriate service method based on whether we're granting or revoking
    const serviceCall = grant 
      ? this.facilitatorService.grantReceptionPrivilege(facilitator.email)
      : this.facilitatorService.revokeReceptionPrivilege(facilitator.email);
    
    serviceCall
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          // Update the local state to reflect the new privilege status
          const updatedFacilitators = this.facilitators.map(f => {
            if (f.id === facilitator.id) {
              return { ...f, hasReceptionPrivilege: grant };
            }
            return f;
          });
          
          this.facilitators = updatedFacilitators;
          
          // Show success message
          this.showNotification(
            'success', 
            `Reception privilege ${actionText}ed for ${facilitatorName}`
          );
        },
        error: (error) => {
          console.error(`Error ${actionText}ing reception privilege:`, error);
          this.showNotification(
            'error', 
            `Failed to ${actionText} reception privilege: ${error.message}`
          );
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadFacilitators();
  }

  // Helper methods
  private getFullName(facilitator: FacilitatorViewModel): string {
    return `${facilitator.firstName} ${facilitator.middleName ? facilitator.middleName + ' ' : ''}${facilitator.lastName}`;
  }

  /**
   * Display a notification using the global notification service
   */
  private showNotification(type: 'success' | 'error' | 'info', message: string, duration = 5000): void {
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
