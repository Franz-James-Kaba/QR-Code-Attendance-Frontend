import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';

import { ModalService, ModalType } from '../../../core/services/modal.service';
import {
  FacilitatorViewModel,
  mapToApiModel as mapFacilitatorToApiModel,
} from '../../models/facilitator.model';
import { NSPViewModel, mapToApiModel as mapNspToApiModel } from '../../models/nsp.model';
import { FacilitatorService } from '../../services/facilitator.service';
import { NspService } from '../../services/nsp.service';
import { FacilitatorFormComponent } from '../facilitator-form/facilitator-form.component';
import { ModalComponent } from '../modal/modal.component';
import { NspFormComponent } from '../nsp-form/nsp-form.component';
import { SessionFormComponent } from '../session-form/session-form.component';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule, ModalComponent, FacilitatorFormComponent, NspFormComponent, SessionFormComponent],
  templateUrl: './modal-container.component.html',
})
export class ModalContainerComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly modalService = inject(ModalService);
  private readonly nspService = inject(NspService);
  private readonly facilitatorService = inject(FacilitatorService);
  private readonly router = inject(Router);

  // Modal state
  isModalVisible = false;
  modalType: ModalType = null;
  modalData: any = null;
  modalTitle = '';
  isSubmitting = false;
  submitAction: 'create' | 'update' | null = null;
  private modalDataCache: any = null; // Add this line

  ngOnInit(): void {
    // Subscribe to modal visibility changes
    this.modalService.modalVisible$.pipe(takeUntil(this.destroy$)).subscribe(visible => {
      this.isModalVisible = visible;
    });

    // Subscribe to modal type changes
    this.modalService.modalType$.pipe(takeUntil(this.destroy$)).subscribe(type => {
      this.modalType = type;
      this.updateModalTitle();
    });

    // Subscribe to modal data changes
    this.modalService.modalData$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.modalData = data;
      this.modalDataCache = data; // Cache the original data
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private updateModalTitle(): void {
    switch (this.modalType) {
      case 'createNsp':
        this.modalTitle = 'Create New NSP';
        break;
      case 'editNsp':
        this.modalTitle = 'Edit NSP';
        break;
      case 'createFacilitator':
        this.modalTitle = 'Create New Facilitator';
        break;
      case 'editFacilitator':
        this.modalTitle = 'Edit Facilitator';
        break;
      case 'createSession':
        this.modalTitle = 'Create New Session';
        break;
      case 'editSession':
        this.modalTitle = 'Edit Session';
        break;
      default:
        this.modalTitle = 'Modal';
    }
  }

  /**
   * Handles modal close events
   */
  onModalClose(): void {
    if (!this.isSubmitting) {
      this.modalService.closeModal();
    }
  }
  /**
   * Handles form submission events
   */
  onFormSubmit(data: any): void {
    this.isSubmitting = true;

    if (this.modalType === 'createNsp' || this.modalType === 'editNsp') {
      this.handleNspFormSubmit(data as NSPViewModel);
    } else if (this.modalType === 'createFacilitator' || this.modalType === 'editFacilitator') {
      this.handleFacilitatorFormSubmit(data as FacilitatorViewModel);
    } else if (this.modalType === 'createSession' || this.modalType === 'editSession') {
      // For session forms, we need to forward the data to the correct component
      const modalConfig = this.modalService.getModal(this.modalType);

      if (modalConfig && modalConfig.component) {
        try {
          // Call the appropriate method on the component
          if (this.modalType === 'createSession' && modalConfig.component.createSession) {
            modalConfig.component.createSession(data);
          } else if (this.modalType === 'editSession' && modalConfig.component.updateSession) {
            modalConfig.component.updateSession(data);
          }
        } catch (error) {
          console.error('Error handling session form:', error);
        } finally {
          this.isSubmitting = false;
        }
      } else {
        this.modalService.closeModal();
        this.isSubmitting = false;
      }
    } else {
      // Unknown modal type, just close it
      this.modalService.closeModal();
      this.isSubmitting = false;
    }
  }

  /**
   * Handle NSP form submission
   */
  private handleNspFormSubmit(nsp: NSPViewModel): void {
    const apiModel = mapNspToApiModel(nsp);
    this.isSubmitting = true;

    if (this.modalType === 'editNsp' && nsp.id) {
      // Update existing NSP
      this.submitAction = 'update';
      const nspId = parseInt(nsp.id);

      this.nspService
        .updateNsp(nspId, apiModel)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this.submitAction = null;
          })
        )
        .subscribe({
          next: response => {
            this.modalService.closeModal();
            // Redirect with success message
            this.navigateWithSuccess(`${nsp.firstName} ${nsp.lastName} updated successfully`);
          },
          error: error => {
            console.error('Error updating NSP:', error);
            // We'll let the parent component handle errors instead of using an alert
          },
        });
    } else {
      // Create new NSP
      this.submitAction = 'create';
      this.nspService
        .createNsp(apiModel)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this.submitAction = null;
          })
        )
        .subscribe({
          next: () => {
            this.modalService.closeModal();
            // Redirect with success message
            this.navigateWithSuccess(`${nsp.firstName} ${nsp.lastName} created successfully`);
          },
          error: error => {
            console.error('Error creating NSP:', error);
            // We'll let the parent component handle errors instead of using an alert
          },
        });
    }
  }

  /**
   * Handle Facilitator form submission
   */  private handleFacilitatorFormSubmit(facilitator: FacilitatorViewModel): void {
    const apiModel = mapFacilitatorToApiModel(facilitator);
    this.isSubmitting = true;

    if (this.modalType === 'editFacilitator' && facilitator.id) {
      // Update existing Facilitator
      this.submitAction = 'update';
      const facilitatorId = parseInt(facilitator.id);

      // First update the facilitator details
      this.facilitatorService
        .updateFacilitator(facilitatorId, apiModel)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this.submitAction = null;
          })
        )
        .subscribe({
          next: response => {
            // Now handle reception privilege if necessary
            this.handleReceptionPrivilege(facilitator).then(() => {
              this.modalService.closeModal();
              // Redirect with success message
              this.navigateWithSuccess(
                `${facilitator.firstName} ${facilitator.lastName} updated successfully`
              );
            });
          },
          error: error => {
            console.error('Error updating Facilitator:', error);
            // We'll let the parent component handle errors instead of using an alert
          },
        });
    } else {
      // Create new Facilitator
      this.submitAction = 'create';
      this.facilitatorService
        .createFacilitator(apiModel)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this.submitAction = null;
          })
        )
        .subscribe({
          next: (response) => {
            // For new facilitator, we need to get the email from the form
            // since the API might return only a success message
            const email = facilitator.email;

            // Handle reception privilege if enabled
            if (facilitator.hasReceptionPrivilege) {
              this.facilitatorService.grantReceptionPrivilege(email).subscribe({
                next: () => {
                  this.modalService.closeModal();
                  this.navigateWithSuccess(
                    `${facilitator.firstName} ${facilitator.lastName} created successfully with reception privileges`
                  );
                },
                error: (error) => {
                  console.error('Error granting reception privilege:', error);
                  this.modalService.closeModal();
                  this.navigateWithSuccess(
                    `${facilitator.firstName} ${facilitator.lastName} created successfully, but reception privileges could not be granted`
                  );
                }
              });
            } else {
              this.modalService.closeModal();
              this.navigateWithSuccess(
                `${facilitator.firstName} ${facilitator.lastName} created successfully`
              );
            }
          },
          error: error => {
            console.error('Error creating Facilitator:', error);
            // We'll let the parent component handle errors instead of using an alert
          },
        });
    }
  }

  /**
   * Handle reception privilege changes for a facilitator
   * @param facilitator The facilitator with updated privilege status
   * @returns Promise that resolves when the privilege update is complete
   */
  private handleReceptionPrivilege(facilitator: FacilitatorViewModel): Promise<void> {
    return new Promise<void>((resolve) => {
      const originalData = this.modalDataCache as FacilitatorViewModel | null;

      // If no original data or no change in privileges, just resolve
      if (!originalData || originalData.hasReceptionPrivilege === facilitator.hasReceptionPrivilege) {
        resolve();
        return;
      }

      // Determine if we need to grant or revoke privileges
      if (facilitator.hasReceptionPrivilege && !originalData.hasReceptionPrivilege) {
        // Grant privileges
        this.facilitatorService.grantReceptionPrivilege(facilitator.email).subscribe({
          next: () => resolve(),
          error: (err) => {
            console.error('Error granting reception privilege:', err);
            resolve(); // Still resolve to continue the flow
          }
        });
      } else if (!facilitator.hasReceptionPrivilege && originalData.hasReceptionPrivilege) {
        // Revoke privileges
        this.facilitatorService.revokeReceptionPrivilege(facilitator.email).subscribe({
          next: () => resolve(),
          error: (err) => {
            console.error('Error revoking reception privilege:', err);
            resolve(); // Still resolve to continue the flow
          }
        });
      } else {
        // No change needed
        resolve();
      }
    });
  }

  /**
   * Handles form cancel events
   */
  onFormCancel(): void {
    if (!this.isSubmitting) {
      this.modalService.closeModal();
    }
  }

  /**
   * Navigate to the current route with success message as query param
   */
  private navigateWithSuccess(message: string): void {
    this.router.navigate([], {
      queryParams: { success: 'true', message },
      queryParamsHandling: 'merge',
    });
  }
}
