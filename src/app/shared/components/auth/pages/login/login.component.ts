import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { amaliTechEmailValidator } from '../../../../shared/validators/email.validator';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputFieldComponent } from '../../../../shared/components/input-field/input-field.component';
import { AuthActions } from '../../../../../../core/store/states/auth/auth.actions';
import { selectIsLoading, selectAuthError } from '../../../../../../core/store/states/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputFieldComponent, ReactiveFormsModule, ButtonComponent, RouterLink, AsyncPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly store = inject(Store);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, amaliTechEmailValidator()]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading$ = this.store.select(selectIsLoading);
  error$ = this.store.select(selectAuthError).pipe(takeUntilDestroyed(this.destroyRef));

  onSubmit(): void {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      this.store.dispatch(
        AuthActions.login({
          email: formValue.email ?? '',
          password: formValue.password ?? '',
        })
      );
    }
  }
}
