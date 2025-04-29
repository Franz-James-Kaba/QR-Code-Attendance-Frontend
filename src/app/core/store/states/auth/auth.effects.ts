import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '@core/services/auth/auth.service';
import { NotificationService } from '@shared/services/notification.service';
import { AuthStep } from '@shared/models/auth/auth.model';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, tap, switchMap } from 'rxjs/operators';

import { AuthActions } from './auth.actions';

export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  initAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initAuth),
      map(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          return AuthActions.initAuthSuccess({ token });
        } else {
          // If no token found, log out
          return AuthActions.logout();
        }
      })
    )
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map(response => {
            this.notificationService.success('Login successful');
            return AuthActions.loginSuccess({ response });
          }),
          catchError(error =>
            of(
              AuthActions.loginFailure({
                error: error.message || 'An error occurred during login',
              })
            )
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          // Handle password reset if required
          if (response.passwordResetRequired) {
            this.router.navigate(['/auth/reset-password']);
            return;
          }

          // Route based on role
          switch (response.role) {
            case 'ADMIN':
              this.router.navigate(['/admin']);
              break;
            case 'NSP':
              this.router.navigate(['/nsp']);
              break;
            case 'FACILITATOR':
              this.router.navigate(['/facilitator']);
              break;
            default:
              this.router.navigate(['/auth/login']);
          }
        })
      ),
    { dispatch: false }
  );

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      exhaustMap(({ email, token, password, confirmPassword }) =>
        this.authService.resetPassword(email, token, { password, confirmPassword }).pipe(
          map(() => {
            this.notificationService.success('Password successfully reset');
            return AuthActions.resetPasswordSuccess();
          }),
          catchError(error =>
            of(
              AuthActions.resetPasswordFailure({
                error: error.message || 'Failed to reset password',
              })
            )
          )
        )
      )
    )
  );

  firstTimePasswordReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.firstTimePasswordReset),
      exhaustMap(({ email, password, confirmPassword }) =>
        this.authService.firstTimePasswordReset(email, { password, confirmPassword }).pipe(
          map(() => {
            this.notificationService.success('Password has been updated successfully');
            return AuthActions.resetPasswordSuccess();
          }),
          catchError(error =>
            of(
              AuthActions.resetPasswordFailure({
                error: error.message || 'Failed to update password',
              })
            )
          )
        )
      )
    )
  );

  resetPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.resetPasswordSuccess),
        tap(() => {
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout();
          this.notificationService.info('You have been logged out');
        })
      ),
    { dispatch: false }
  );

  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      exhaustMap(({ email }) =>
        this.authService.requestPasswordReset(email).pipe(
          map(() => {
            this.notificationService.success('Password reset instructions sent to your email');
            return AuthActions.forgotPasswordSuccess();
          }),
          catchError(error =>
            of(
              AuthActions.forgotPasswordFailure({
                error: error.message || 'Failed to send password reset instructions',
              })
            )
          )
        )
      )
    )
  );

  forgotPasswordSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPasswordSuccess),
      map(() => AuthActions.setAuthStep({ step: AuthStep.OTP }))
    )
  );
}
