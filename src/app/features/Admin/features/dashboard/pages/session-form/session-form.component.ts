import { ModalService } from '@Admin/core/services/modal.service';
import {
  CreateSessionRequest,
  Session,
  UpdateSessionRequest,
} from '@Admin/shared/models/session/session.model';
import { SessionService } from '@Admin/shared/services/session.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NotificationService } from '@shared/components/notification/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './session-form.component.html',
})
export class SessionFormComponent implements OnInit {
  // Dependencies
  private readonly fb = inject(FormBuilder);
  private readonly sessionService = inject(SessionService);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);

  // Component state
  form!: FormGroup;
  isEdit = false;
  isSubmitting = false;
  sessionToEdit: Session | null = null;

  // Date-time limits
  minDate = this.formatDateForInput(new Date());

  ngOnInit(): void {
    this.initForm();

    // Register form with the modal service
    this.modalService.registerModal('createSession', {
      component: this,
      onOpen: () => {
        this.resetForm();
        this.isEdit = false;
      },
    });

    this.modalService.registerModal('editSession', {
      component: this,
      onOpen: (session: Session) => {
        this.sessionToEdit = session;
        this.isEdit = true;
        this.patchForm(session);
      },
    });
  }

  initForm(): void {
    // Create form with validators - using non-deprecated syntax
    this.form = this.fb.group({
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
    });

    // Add validators separately to avoid deprecation warning
    this.form.setValidators(this.validateDateRange());
  }

  resetForm(): void {
    this.form.reset();
    this.sessionToEdit = null;
    this.isEdit = false;
  }

  patchForm(session: Session): void {
    const startDateTime = this.formatDateTimeForInput(new Date(session.startTime));
    const endDateTime = this.formatDateTimeForInput(new Date(session.endTime));

    this.form.patchValue({
      startTime: startDateTime,
      endTime: endDateTime,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Format dates for API
    const formValue = this.form.value;
    const startTime = new Date(formValue.startTime ?? '').toISOString();
    const endTime = new Date(formValue.endTime ?? '').toISOString();

    if (this.isEdit && this.sessionToEdit) {
      // Update existing session
      const updates: UpdateSessionRequest = {
        id: this.sessionToEdit.id,
        startTime,
        endTime,
      };

      this.sessionService
        .updateSession(this.sessionToEdit.id, updates)
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe({
          next: updatedSession => {
            this.notificationService.success('Session updated successfully');
            this.closeModal();
            // Signal to parent component to refresh the list
            this.modalService.modalClosed.next({ id: 'editSession', data: updatedSession });
          },
          error: error => {
            this.notificationService.error(error.message ?? 'Failed to update session');
          },
        });
    } else {
      // Create new session
      const newSession: CreateSessionRequest = {
        startTime,
        endTime,
      };

      this.sessionService
        .createSession(newSession)
        .pipe(finalize(() => (this.isSubmitting = false)))
        .subscribe({
          next: createdSession => {
            this.notificationService.success('Session created successfully');
            this.closeModal();
            // Signal to parent component to refresh the list
            this.modalService.modalClosed.next({ id: 'createSession', data: createdSession });
          },
          error: error => {
            this.notificationService.error(error.message ?? 'Failed to create session');
          },
        });
    }
  }

  closeModal(): void {
    this.resetForm();
    this.modalService.closeModal();
  }

  // Custom validator for date range
  validateDateRange(): ValidatorFn {
    return (control: AbstractControl): Record<string, string> | null => {
      const group = control as FormGroup;
      const start = group.get('startTime')?.value;
      const end = group.get('endTime')?.value;

      if (!start || !end) {
        return null;
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (startDate >= endDate) {
        return { dateRange: 'End time must be after start time' };
      }

      // Ensure session is at least 30 minutes long
      const thirtyMinutes = 30 * 60 * 1000;
      if (endDate.getTime() - startDate.getTime() < thirtyMinutes) {
        return { minDuration: 'Session must be at least 30 minutes long' };
      }

      return null;
    };
  }

  // Helper to check if a specific field has an error
  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && !!control.errors?.[errorName];
  }

  // Helper to check if the form has specific error
  hasFormError(errorName: string): boolean {
    return !!this.form.errors?.[errorName];
  }

  // Format date for datetime-local input
  formatDateTimeForInput(date: Date): string {
    return date.toISOString().slice(0, 16);
  }

  // Format date for date input
  formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
