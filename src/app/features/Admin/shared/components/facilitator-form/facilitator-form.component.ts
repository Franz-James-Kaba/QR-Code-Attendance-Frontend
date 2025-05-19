import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';

import { FacilitatorViewModel } from '../../models/facilitator.model';

@Component({
  selector: 'app-facilitator-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './facilitator-form.component.html',
})
export class FacilitatorFormComponent implements OnInit {
  @Input() initialData: FacilitatorViewModel | null = null;
  @Input() isSubmitting = false;

  @Output() formSubmit = new EventEmitter<FacilitatorViewModel>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;

  get isEdit(): boolean {
    return !!this.initialData?.id;
  }

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize the form with default values or existing facilitator data
   */
    private initForm(): void {
    this.form = this.fb.group({
      id: [this.initialData?.id ?? ''],
      firstName: [
        this.initialData?.firstName ?? '',
        [Validators.required, Validators.minLength(3)],
      ],
      middleName: [this.initialData?.middleName ?? ''],
      lastName: [this.initialData?.lastName ?? '', [Validators.required, Validators.minLength(3)]],
      email: [this.initialData?.email ?? '', [Validators.required, Validators.email]],
      program: [this.initialData?.program ?? '', [Validators.required]],
    });
  }

  /**
   * Submit the form if valid
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    const formData = this.form.value as FacilitatorViewModel;
    this.formSubmit.emit(formData);
  }

  /**
   * Cancel form submission
   */
  onCancel(): void {
    this.formCancel.emit();
  }

  /**
   * Mark all form controls as touched to trigger validation messages
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  /**
   * Helper method to check if a form control has a specific error
   */
  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return control !== null && control.touched && control.hasError(errorName);
  }
}
