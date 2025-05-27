import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { environment } from '@environments/environment';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthResponse, AuthStep, User, UserRole } from '@shared/models/auth/auth.model';
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
  private readonly http = inject(HttpClient);

  initAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initAuth),
      map(() => {
        const token = this.authService.getToken();
        if (token) {
          const userStr = localStorage.getItem('current_user');
          if (userStr) {
            try {
              const userData: User = JSON.parse(userStr);
              const response: AuthResponse = {
                token,
                role: userData.role,
                email: userData.email,
                passwordResetRequired: userData.passwordResetRequired ?? false,
              };
              return AuthActions.loginSuccess({ response });
            } catch (e) {
              console.error('Error parsing stored user data during init', e);
              return AuthActions.logout();
            }
          }
        }
        return AuthActions.logout();
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
          if (response.passwordResetRequired) {
            this.router.navigate(['/auth/reset-password']);
            return;
          }

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
            return of(
              AuthActions.firstTimePasswordResetFailure({
                error: error.message ?? 'Failed to update password',
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
          this.authService.logout();
          this.notificationService.info('You have been logged out');
          this.router.navigate(['/auth/login']);
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

  fetchUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.fetchUserProfile),
      exhaustMap(() => {
        const token = this.authService.getToken();
        if (!token) {
          return of(AuthActions.logout());
        }
        return this.http
          .get<{
            firstName: string;
            middleName: string | null;
            lastName: string;
            role: string;
            checkedIn: boolean;
          }>(`${environment.api.baseUrl}/metrics/user-info`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .pipe(
            map(profile => {
              const currentUser = this.authService.getCurrentUser();
              const validRole: UserRole = this.authService['isValidUserRole'](profile.role)
                ? profile.role
                : currentUser?.role || 'NSP';
              const updatedUser: User = {
                ...currentUser,
                firstName: profile.firstName,
                lastName: profile.lastName,
                middleName: profile.middleName,
                role: validRole,
                checkedIn: profile.checkedIn,
                email: currentUser?.email ?? '',
                passwordResetRequired: currentUser?.passwordResetRequired ?? false,
              };
              localStorage.setItem('current_user', JSON.stringify(updatedUser));
              localStorage.setItem('last_profile_fetch', Date.now().toString());
              this.authService['currentUserSubject'].next(updatedUser);
              return AuthActions.fetchUserProfileSuccess({ user: updatedUser });
            }),
            catchError(error => {
              console.error('Error fetching user profile:', error);
              if (error.status === 401) {
                return of(AuthActions.logout());
              }
              return of(
                AuthActions.fetchUserProfileFailure({
                  error: 'Failed to load user profile',
                })
              );
            })
          );
      })
    )
  );
}
