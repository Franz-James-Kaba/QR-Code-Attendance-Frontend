import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthActions } from '@store/states/auth/auth.actions';
import { selectAuthStep, selectIsLoading, selectAuthError } from '@store/states/auth/auth.selectors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from "@shared/components/input-field/input-field.component";
import { ButtonComponent } from "@shared/components/button/button.component";
import { OtpInputComponent } from '@app/shared/components/otp-input/otp-input.component';
import { AuthStep } from '@app/shared/models/auth.model';
import { map, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { amaliTechEmailValidator } from '@app/shared/validators/email.validator';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  imports: [InputFieldComponent, ButtonComponent, AsyncPipe, ReactiveFormsModule, OtpInputComponent, RouterLink],
  standalone: true
})
export class ForgotPasswordComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, amaliTechEmailValidator()]],
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, {validators: this.passwordMatchValidator() });

  currentStep$ = this.store.select(selectAuthStep);
  isLoading$ = this.store.select(selectIsLoading);
  error$ = this.store.select(selectAuthError).pipe(
    takeUntilDestroyed(this.destroyRef)
  );

  isSubmitting$ = this.store.select(selectIsLoading);

  readonly AuthStep = AuthStep;

  isStepValid$ = combineLatest([
    this.currentStep$,
    this.forgotPasswordForm.statusChanges
  ]).pipe(
    map(([step]) => {
      if (!step) return false;

      const emailControl = this.forgotPasswordForm.get('email');
      const otpControl = this.forgotPasswordForm.get('otp');
      const newPasswordControl = this.forgotPasswordForm.get('newPassword');
      const confirmPasswordControl = this.forgotPasswordForm.get('confirmPassword');

      switch (step) {
        case AuthStep.EMAIL:
          return emailControl?.valid ?? false;
        case AuthStep.OTP:
          return otpControl?.valid ?? false;
        case AuthStep.RESET_PASSWORD:
          return (newPasswordControl?.valid &&
                 confirmPasswordControl?.valid &&
                 newPasswordControl?.value === confirmPasswordControl?.value) ?? false;
        default:
          return false;
      }
    })
  );

  ngOnInit(): void {
    this.store.dispatch(AuthActions.setAuthStep({ step: AuthStep.EMAIL }));
  }

  getErrorMessage(controlName: string): string {
    const control = this.forgotPasswordForm.get(controlName);
    if (!control?.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email';
    if (control.errors['pattern']) return 'Please enter a valid 6-digit code';
    if (control.errors['minlength']) return 'Password must be at least 8 characters';

    return '';
  }

  private passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get('newPassword')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      return newPassword === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  onSubmit(): void {
    this.currentStep$.pipe(take(1)).subscribe(step => {
      if (!step) return;

      switch (step) {
        case AuthStep.EMAIL: {
          const email = this.forgotPasswordForm.get('email')?.value;
          if (email) {
            this.store.dispatch(AuthActions.forgotPassword({ email }));
          }
          break;
        }
        case AuthStep.OTP: {
          const otp = this.forgotPasswordForm.get('otp')?.value;
          if (otp) {
            this.store.dispatch(AuthActions.verifyOtp({ otp }));
          }
          break;
        }
        case AuthStep.RESET_PASSWORD: {
          const newPassword = this.forgotPasswordForm.get('newPassword')?.value;
          if (newPassword) {
            this.store.dispatch(AuthActions.resetPassword({
              newPassword,
              oldPassword: ''
            }));
          }
          break;
        }
      }
    });
  }
}
