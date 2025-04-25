import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent, ButtonComponent, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  private readonly fb = inject(FormBuilder);
  constructor() {}

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      newPassword: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
          nonNullable: true,
        },
      ],
      confirmPassword: [
        '',
        {
          validators: [Validators.required],
          nonNullable: true,
        },
      ],
    });

    // Add password match validator as a form-level validator
    this.resetPasswordForm.addValidators(this.passwordMatchValidator());
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
  onSubmit() {
    if (this.resetPasswordForm.valid) {
      // Implement password reset logic here
      return this.resetPasswordForm.value;
    }
  }
}
