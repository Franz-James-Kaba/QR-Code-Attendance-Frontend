import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NotificationService } from '@shared/components/notification/notification.service';
import { finalize } from 'rxjs';

import { ModalService } from '../../../../core/services/modal.service';
import { DeleteConfirmationComponent } from '../../../../shared/components/delete-confirmation/delete-confirmation.component';
import { ModalContainerComponent } from '../../../../shared/components/modal-container/modal-container.component';
import { NspBulkImportComponent } from '../../../../shared/components/nsp-bulk-import/nsp-bulk-import.component';
import { NspTableComponent } from '../../../../shared/components/nsp-table/nsp-table.component';
import { NSPImportResult, NSPViewModel, mapToApiModel } from '../../../../shared/models/nsp.model';
import { NspService } from '../../../../shared/services/nsp.service';

@Component({
  selector: 'app-nsp-overview',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    NspTableComponent,
    DeleteConfirmationComponent,
    ModalContainerComponent,
    NspBulkImportComponent,
  ],
  templateUrl: './nsp-overview.component.html',
})
export class NspOverviewComponent implements OnInit {
  hasRecords = false;
  showDeleteModal = false;
  nspToDelete: NSPViewModel | null = null;
  showBulkImportModal = false;
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  isLoading = false;
  nsps: NSPViewModel[] = [];

  private readonly route = inject(ActivatedRoute);
  private readonly modalService = inject(ModalService);
  private readonly nspService = inject(NspService);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    // Reset pagination to safe defaults
    this.currentPage = 0;
    this.pageSize = 10;

    // Check for success messages from redirects (after edit/create/delete)
    this.route.queryParams.subscribe(params => {
      if (params['success']) {
        this.showNotification('success', params['message'] ?? 'Operation successful');
      }
    });

    // Load NSPs from service
    this.loadNsps();
  }

  // Load NSPs from API with pagination
  loadNsps(): void {
    this.isLoading = true;

    this.nspService
      .getAllNsps(this.currentPage, this.pageSize)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: result => {
          this.nsps = result.data;
          this.totalItems = result.total;

          // Update UI state
          this.hasRecords = this.nsps.length > 0;
        },
        error: error => {
          console.error('Error loading NSPs:', error);
          this.showNotification('error', 'Failed to load NSP data: ' + error.message);
        },
      });
  }

  // Methods for handling NSP actions using the shared modal service
  createNsp(): void {
    this.modalService.openModal('createNsp');
  }

  editNsp(nsp: NSPViewModel): void {
    this.modalService.openModal('editNsp', nsp);
  }

  // Delete confirmation methods
  confirmDelete(nsp: NSPViewModel): void {
    this.nspToDelete = nsp;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.nspToDelete = null;
  }

  executeDelete(): void {
    if (this.nspToDelete) {
      const nspId = parseInt(this.nspToDelete.id);
      if (isNaN(nspId)) {
        this.showNotification('error', 'Invalid NSP ID');
        return;
      }

      this.isLoading = true;

      this.nspService
        .deleteNsp(nspId)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            // Show success message
            const fullName = this.getFullName(this.nspToDelete!);
            this.showNotification('success', `${fullName} has been successfully deleted`);

            // Reload the NSP list
            this.loadNsps();

            // Close modal
            this.showDeleteModal = false;
            this.nspToDelete = null;
          },
          error: error => {
            console.error('Error deleting NSP:', error);
            this.showNotification('error', 'Failed to delete NSP: ' + error.message);
          },
        });
    }
  }

  onPageChange(page: number): void {
    // Ensure page is never negative
    this.currentPage = Math.max(0, page);
    this.loadNsps();
  }

  openBulkImport(): void {
    this.showBulkImportModal = true;
  }

  closeBulkImport(): void {
    this.showBulkImportModal = false;
  }

  handleImportComplete(result: NSPImportResult): void {
    this.showBulkImportModal = false;

    const failedMessage = result.failed > 0 ? 'Failed to import ' + result.failed + ' NSPs.' : '';
    this.showNotification(
      'success',
      `Successfully imported ${result.successful} NSPs. ${failedMessage}`
    );

    this.loadNsps();
  }
  handleNspFormSubmit(nsp: NSPViewModel): void {
    const apiModel = mapToApiModel(nsp);
    this.isLoading = true;
    const fullName = this.getFullName(nsp);

    if (nsp.id && !isNaN(parseInt(nsp.id))) {
      // Update existing NSP
      const nspId = parseInt(nsp.id);

      this.nspService
        .updateNsp(nspId, apiModel)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            // First close the modal
            this.modalService.closeModal();

            // Then show success message
            this.showNotification('success', `${fullName} has been updated successfully`);

            // Reload the data
            this.loadNsps();
          },
          error: error => {
            console.error('Error updating NSP:', error);
            this.showNotification('error', 'Failed to update NSP: ' + error.message);
          },
        });
    } else {
      // Create new NSP
      this.nspService
        .createNsp(apiModel)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            // First close the modal
            this.modalService.closeModal();

            // Then show success message
            this.showNotification('success', `${fullName} has been created successfully`);

            // Reload the data
            this.loadNsps();
          },
          error: error => {
            console.error('Error creating NSP:', error);
            this.showNotification('error', 'Failed to create NSP: ' + error.message);
          },
        });
    }
  }

  // Helper methods
  private getFullName(nsp: NSPViewModel): string {
    return `${nsp.firstName} ${nsp.middleName ? nsp.middleName + ' ' : ''}${nsp.lastName}`;
  }

  /**
   * Display a notification using the global notification service
   */
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
