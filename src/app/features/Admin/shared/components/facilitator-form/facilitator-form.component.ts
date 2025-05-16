import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';

interface FacilitatorData {
  name: string;
  email: string;
  phone: string;
  program: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-facilitator-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './facilitator-form.component.html',
})
export class FacilitatorFormComponent {
  private readonly fb = inject(FormBuilder);

  @Input() initialData: FacilitatorData | null = null;
  @Output() formSubmit = new EventEmitter<FacilitatorData>();
  @Output() formCancel = new EventEmitter<void>();

  facilitatorForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.facilitatorForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      program: ['', [Validators.required]],
      role: ['facilitator', [Validators.required]],
      status: ['active', [Validators.required]],
    });

    // If we have initial data, populate the form
    if (this.initialData) {
      this.facilitatorForm.patchValue(this.initialData);
    }
  }

  onSubmit(): void {
    if (this.facilitatorForm.valid) {
      this.isSubmitting = true;
      const formData = this.facilitatorForm.value;

      // Emit the form data to parent component
      this.formSubmit.emit(formData);

      // Reset form after submission (in a real app, we'd do this after successful API response)
      setTimeout(() => {
        this.isSubmitting = false;
        this.facilitatorForm.reset({
          role: 'facilitator',
          status: 'active',
        });
      }, 800);
    } else {
      // Mark all fields as touched to trigger validation visuals
      this.facilitatorForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
