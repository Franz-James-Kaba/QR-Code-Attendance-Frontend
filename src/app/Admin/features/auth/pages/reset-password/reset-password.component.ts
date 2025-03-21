import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputFieldComponent,
    ButtonComponent,
    RouterModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', {
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ],
        nonNullable: true
      }],
      confirmPassword: ['', {
        validators: [Validators.required],
        nonNullable: true
      }]
    });

    // Add password match validator as a form-level validator
    this.resetPasswordForm.addValidators(
      this.passwordMatchValidator()
    );
  }

  // Update password match validator to be a factory function
  private passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const newPassword = formGroup.get('newPassword')?.value;
      const confirmPassword = formGroup.get('confirmPassword')?.value;

      return newPassword === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  get newPasswordControl() {
    return this.resetPasswordForm.get('newPassword');
  }

  get passwordError(): string {
    const control = this.newPasswordControl;
    if (!control?.errors) return '';

    if (control.errors['required']) return 'Password is required';
    if (control.errors['minlength']) return 'Password must be at least 8 characters';
    if (control.errors['pattern']) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
    }
    return '';
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      // Implement password reset logic here
      console.log(this.resetPasswordForm.value);
    }
  }
}
