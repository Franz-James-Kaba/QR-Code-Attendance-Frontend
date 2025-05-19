import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthStep } from '@shared/models/auth/auth.model';
import { NotificationService } from '@shared/services/notification.service';
import { AuthActions } from '@store/actions/auth.actions';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, tap } from 'rxjs/operators';

@Injectable()
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
        const userDataStr = localStorage.getItem('auth_user');

        if (token && userDataStr) {
          try {
            // We have both token and user data, update auth state with complete info
            const userData = JSON.parse(userDataStr);
            return AuthActions.loginSuccess({
              response: {
                token,
                role: userData.role,
                email: userData.email,
                passwordResetRequired: userData.passwordResetRequired
              }
            });
          } catch (e) {
            console.error('Error parsing auth user data:', e);
            return AuthActions.logout();
          }
        } else if (token) {
          // We have only token but no user data (backward compatibility)
          return AuthActions.initAuthSuccess({ token });
        } else {
          // No token found, log out
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
                error: error.message ?? 'An error occurred during login',
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
          // Store user data in localStorage for persistence across page refreshes
          localStorage.setItem('auth_user', JSON.stringify({
            role: response.role,
            email: response.email,
            passwordResetRequired: response.passwordResetRequired
          }));

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
                error: error.message ?? 'Failed to reset password',
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
            return AuthActions.firstTimePasswordResetSuccess();
          }),
          catchError(error => {
            console.error('firstTimePasswordReset error:', error);
            // Extract the specific error message
            let errorMessage = error.message;

            // Check for specific validation errors related to password
            if (errorMessage.includes('password')) {
              errorMessage = 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.';
            }

            this.notificationService.error(errorMessage);
            return of(
              AuthActions.firstTimePasswordResetFailure({
                error: errorMessage
              })
            );
          })
        )
      )
    )
  );

  firstTimePasswordResetSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.firstTimePasswordResetSuccess),
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
          // Get current URL to check if we're in a protected route
          const currentUrl = this.router.url;
          const isInProtectedRoute = currentUrl.includes('/admin') ||
                                    currentUrl.includes('/nsp') ||
                                    currentUrl.includes('/facilitator');

          // Clear auth data using the auth service
          this.authService.logout();

          // Navigate back to login page with return URL for better UX
          if (isInProtectedRoute) {
            // If in protected route, include returnUrl parameter
            this.router.navigate(['/auth/login'], {
              queryParams: { returnUrl: currentUrl }
            });

            // Show session expiration message if coming from a protected route
            this.notificationService.warning('Your session has expired. Please log in again.');
          } else {
            // Normal logout, probably user-initiated
            this.router.navigate(['/auth/login']);
            this.notificationService.info('You have been logged out');
          }
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
                error: error.message ?? 'Failed to send password reset instructions',
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
