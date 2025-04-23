import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { ModalService, ModalType } from '../../services/modal.service';
import { FacilitatorFormComponent } from '../facilitator-form/facilitator-form.component';
import { ModalComponent } from '../modal/modal.component';
import { NspFormComponent } from '../nsp-form/nsp-form.component';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule, ModalComponent, FacilitatorFormComponent, NspFormComponent],
  templateUrl: './modal-container.component.html',
})
export class ModalContainerComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly modalService = inject(ModalService);
  // Modal state
  isModalVisible = false;
  modalType: ModalType = null;
  modalData: any = null;
  modalTitle = '';

  constructor() {}

  ngOnInit(): void {
    // Subscribe to modal visibility changes
    this.modalService.modalVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe(visible => {
        this.isModalVisible = visible;
      });

    // Subscribe to modal type changes
    this.modalService.modalType$
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        this.modalType = type;
        this.updateModalTitle();
      });

    // Subscribe to modal data changes
    this.modalService.modalData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.modalData = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Updates the modal title based on the modal type
   */
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
      default:
        this.modalTitle = 'Modal';
    }
  }

  /**
   * Handles modal close events
   */
  onModalClose(): void {
    this.modalService.closeModal();
  }

  /**
   * Handles form submission events
   */
  onFormSubmit(data: any): void {
    console.log('Form submitted:', data);
    
    // TODO: Handle the form data (e.g., API calls)
    // For now, just close the modal
    setTimeout(() => {
      this.modalService.closeModal();
    }, 500);
  }

  /**
   * Handles form cancel events
   */
  onFormCancel(): void {
    this.modalService.closeModal();
  }
}