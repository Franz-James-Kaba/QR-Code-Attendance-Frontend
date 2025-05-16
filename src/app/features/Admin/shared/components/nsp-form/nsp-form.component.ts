import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';

import { NSP } from '../nsp-table/nsp-table.component';

@Component({
  selector: 'app-nsp-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './nsp-form.component.html',
})
export class NspFormComponent implements OnInit, OnChanges {
  @Input() initialData: NSP | null = null;
  @Output() formSubmit = new EventEmitter<NSP>();
  @Output() formCancel = new EventEmitter<void>();

  nspForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;

  private readonly fb = inject(FormBuilder);

  constructor() {
    this.nspForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.isEditMode = true;
      this.patchForm();
    } else if (!this.initialData) {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [{ value: '', disabled: true }],
      name: ['', [Validators.required]],
      stack: ['', [Validators.required]],
      status: ['Active', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      program: ['', [Validators.required]],
      joinDate: ['', [Validators.required]],
    });
  }

  initializeForm(): void {
    if (this.initialData) {
      this.isEditMode = true;
      this.patchForm();
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  patchForm(): void {
    if (this.initialData) {
      this.nspForm.patchValue({
        id: this.initialData.id,
        name: this.initialData.name,
        stack: this.initialData.stack,
        status: this.initialData.status,
        email: this.initialData.email,
        phone: this.initialData.phone,
        program: this.initialData.program,
        joinDate: this.initialData.joinDate,
      });
    }
  }

  resetForm(): void {
    this.nspForm.reset({
      id: 'NSP-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Active',
    });
  }

  onSubmit(): void {
    if (this.nspForm.valid) {
      this.isSubmitting = true;
      const formData = this.nspForm.getRawValue();

      // Emit the form data to parent component
      this.formSubmit.emit(formData);

      // Reset form after submission (in a real app, we'd do this after successful API response)
      setTimeout(() => {
        this.isSubmitting = false;
      }, 800);
    } else {
      this.nspForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
