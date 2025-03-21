import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthActions } from './auth.actions';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, tap } from 'rxjs/operators';
import { AuthStep } from '@app/shared/models/auth.model';

export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map(response => AuthActions.loginSuccess({ response })),
          catchError(error => of(AuthActions.loginFailure({
            error: error.message || 'An error occurred during login'
          })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          localStorage.setItem('auth_token', response.token);
          const redirectUrl = response.passwordResetRequired
            ? '/auth/reset-password'
            : '/admin/dashboard';
          this.router.navigate([redirectUrl]);
        })
      ),
    { dispatch: false }
  );

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      exhaustMap(({ newPassword }) =>
        this.authService.resetPassword('', newPassword).pipe(
          map(() => AuthActions.resetPasswordSuccess()),
          catchError(error => of(AuthActions.resetPasswordFailure({
            error: error.message || 'Failed to reset password'
          })))
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

  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      exhaustMap(({ email }) =>
        this.authService.forgotPassword(email).pipe(
          map(() => AuthActions.forgotPasswordSuccess()),
          catchError(error => of(AuthActions.forgotPasswordFailure({
            error: error.message || 'Failed to send verification code'
          })))
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

  verifyOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyOtp),
      exhaustMap(({ otp }) =>
        this.authService.verifyOtp(otp).pipe(
          map(() => AuthActions.verifyOtpSuccess()),
          catchError(error => of(AuthActions.verifyOtpFailure({
            error: error.message || 'Invalid verification code'
          })))
        )
      )
    )
  );

  verifyOtpSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyOtpSuccess),
      map(() => AuthActions.setAuthStep({ step: AuthStep.RESET_PASSWORD }))
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('auth_token');
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );
}
