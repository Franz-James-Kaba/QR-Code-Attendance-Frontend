import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { AuthActions } from '@store/actions/auth.actions';
import { selectAuthError, selectIsLoading } from '@store/selectors/auth.selectors';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputFieldComponent,
    ButtonComponent,
    RouterModule,
    AsyncPipe,
  ],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isLoading$ = this.store.select(selectIsLoading);
  error$ = this.store.select(selectAuthError).pipe(takeUntilDestroyed(this.destroyRef));

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

    this.resetPasswordForm.addValidators(this.passwordMatchValidator());
  }

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

  getErrorMessage(controlName: string): string {
    const control = this.resetPasswordForm.get(controlName);
    if (!control?.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength']) return 'Password must be at least 8 characters';
    if (control.errors['pattern'])
      return 'Password must include uppercase, lowercase, number, and special character';

    return '';
  }

  onSubmit() {
    console.log('Form submitted:', this.resetPasswordForm.value);

    if (this.resetPasswordForm.valid) {
      const email = this.authService.getCurrentUserEmail();
      console.log('Current user email:', email);

      const password = this.resetPasswordForm.get('newPassword')?.value;
      const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;

      if (email && password && confirmPassword) {
        console.log('Dispatching firstTimePasswordReset action');
        this.store.dispatch(
          AuthActions.firstTimePasswordReset({
            email,
            password,
            confirmPassword,
          })
        );
      } else {
        console.error('Missing required data:', {
          email,
          password: !!password,
          confirmPassword: !!confirmPassword,
        });
      }
    } else {
      console.error('Form is invalid:', this.resetPasswordForm.errors);
    }
  }
}
