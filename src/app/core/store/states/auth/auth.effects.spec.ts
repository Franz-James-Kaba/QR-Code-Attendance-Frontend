import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { AuthResponse, AuthStep, UserRole } from '@shared/models/auth/auth.model';
import { NotificationService } from '@shared/services/notification.service';
import { Observable, of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthActions } from './auth.actions';
import { AuthEffects } from './auth.effects';

describe('AuthEffects', () => {
  let effects: AuthEffects;
  let actions$: Observable<Action>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let notificationService: jest.Mocked<NotificationService>;

  // Setup localStorage mock
  let localStorageMock: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
  };

  beforeEach(() => {
    // Create localStorage mock
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };

    // Apply mock to global object
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const authServiceSpy = {
      login: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      firstTimePasswordReset: jest.fn(),
      requestPasswordReset: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    const routerSpy = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    const notificationServiceSpy = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });
    effects = TestBed.inject(AuthEffects);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    notificationService = TestBed.inject(NotificationService) as jest.Mocked<NotificationService>;
  });

  describe('initAuth$', () => {
    it('should dispatch loginSuccess when both token and user data exist', done => {
      // Mock localStorage
      const token = 'test-token';
      const userData = {
        role: 'ADMIN' as UserRole,
        email: 'test@example.com',
        passwordResetRequired: false,
      };

      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_token') return token;
        if (key === 'auth_user') return JSON.stringify(userData);
        return null;
      });

      actions$ = of(AuthActions.initAuth());

      effects.initAuth$.pipe(take(1)).subscribe((action: any) => {
        if (action.type === AuthActions.loginSuccess.type) {
          expect(action.response).toEqual({
            token,
            role: userData.role,
            email: userData.email,
            passwordResetRequired: userData.passwordResetRequired,
          });
          done();
        }
      });
    });

    it('should dispatch initAuthSuccess when only token exists', done => {
      const token = 'test-token';
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_token') return token;
        return null;
      });

      actions$ = of(AuthActions.initAuth());

      effects.initAuth$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.initAuthSuccess.type);
        expect(action.token).toEqual(token);
        done();
      });
    });

    it('should dispatch logout when no token exists', done => {
      localStorageMock.getItem.mockReturnValue(null);

      actions$ = of(AuthActions.initAuth());

      effects.initAuth$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.logout.type);
        done();
      });
    });

    it('should dispatch logout when user data is invalid JSON', done => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_token') return 'test-token';
        if (key === 'auth_user') return 'invalid-json';
        return null;
      });

      actions$ = of(AuthActions.initAuth());

      effects.initAuth$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.logout.type);
        expect(console.error).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('login$', () => {
    it('should dispatch loginSuccess on successful login', done => {
      const credentials = {
        email: 'test@example.com',
        password: 'password',
      };

      const response: AuthResponse = {
        token: 'test-token',
        role: 'ADMIN' as UserRole,
        passwordResetRequired: false,
        email: 'test@example.com',
      };

      authService.login.mockReturnValue(of(response));

      actions$ = of(AuthActions.login(credentials));

      effects.login$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.loginSuccess.type);
        expect(action.response).toEqual(response);
        expect(notificationService.success).toHaveBeenCalledWith('Login successful');
        done();
      });
    });

    it('should dispatch loginFailure on login error', done => {
      const credentials = {
        email: 'test@example.com',
        password: 'password',
      };
      const error = new Error('Login failed');
      authService.login.mockReturnValue(throwError(() => error));

      actions$ = of(AuthActions.login(credentials));

      effects.login$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.loginFailure.type);
        expect(action.error).toEqual('Login failed');
        done();
      });
    });

    it('should use generic error message when error has no message', done => {
      const credentials = {
        email: 'test@example.com',
        password: 'password',
      };

      authService.login.mockReturnValue(throwError(() => ({})));

      actions$ = of(AuthActions.login(credentials));

      effects.login$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.loginFailure.type);
        expect(action.error).toEqual('An error occurred during login');
        done();
      });
    });
  });

  describe('loginSuccess$', () => {
    it('should navigate to reset password when password reset is required', () => {
      const response: AuthResponse = {
        token: 'test-token',
        role: 'ADMIN' as UserRole,
        passwordResetRequired: true,
        email: 'test@example.com',
      };

      actions$ = of(AuthActions.loginSuccess({ response }));

      effects.loginSuccess$.subscribe(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
        expect(router.navigate).toHaveBeenCalledWith(['/auth/reset-password']);
      });
    });

    it('should navigate to admin page for ADMIN role', () => {
      const response: AuthResponse = {
        token: 'test-token',
        role: 'ADMIN' as UserRole,
        passwordResetRequired: false,
        email: 'test@example.com',
      };

      actions$ = of(AuthActions.loginSuccess({ response }));

      effects.loginSuccess$.subscribe(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
      });
    });

    it('should navigate to nsp page for NSP role', () => {
      const response: AuthResponse = {
        token: 'test-token',
        role: 'NSP' as UserRole,
        passwordResetRequired: false,
        email: 'test@example.com',
      };

      actions$ = of(AuthActions.loginSuccess({ response }));

      effects.loginSuccess$.subscribe(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
        expect(router.navigate).toHaveBeenCalledWith(['/nsp']);
      });
    });

    it('should navigate to facilitator page for FACILITATOR role', () => {
      const response: AuthResponse = {
        token: 'test-token',
        role: 'FACILITATOR' as UserRole,
        passwordResetRequired: false,
        email: 'test@example.com',
      };

      actions$ = of(AuthActions.loginSuccess({ response }));

      effects.loginSuccess$.subscribe(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
        expect(router.navigate).toHaveBeenCalledWith(['/facilitator']);
      });
    });

    it('should navigate to login page for unknown role', () => {
      const response = {
        token: 'test-token',
        role: 'UNKNOWN' as UserRole,
        passwordResetRequired: false,
        email: 'test@example.com',
      };

      actions$ = of(AuthActions.loginSuccess({ response }));

      effects.loginSuccess$.subscribe(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', expect.any(String));
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    });
  });

  describe('resetPassword$', () => {
    it('should dispatch resetPasswordSuccess on successful reset', done => {
      const payload = {
        email: 'test@example.com',
        token: 'reset-token',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      authService.resetPassword.mockReturnValue(of('Success'));

      actions$ = of(AuthActions.resetPassword(payload));

      effects.resetPassword$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.resetPasswordSuccess.type);
        expect(notificationService.success).toHaveBeenCalledWith('Password successfully reset');
        done();
      });
    });

    it('should dispatch resetPasswordFailure on reset error', done => {
      const payload = {
        email: 'test@example.com',
        token: 'reset-token',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      const error = new Error('Reset failed');
      authService.resetPassword.mockReturnValue(throwError(() => error));

      actions$ = of(AuthActions.resetPassword(payload));

      effects.resetPassword$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.resetPasswordFailure.type);
        expect(action.error).toEqual('Reset failed');
        done();
      });
    });
  });

  describe('firstTimePasswordReset$', () => {
    it('should dispatch firstTimePasswordResetSuccess on successful reset', done => {
      const payload = {
        email: 'test@example.com',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      authService.firstTimePasswordReset.mockReturnValue(of('Success'));

      actions$ = of(AuthActions.firstTimePasswordReset(payload));

      effects.firstTimePasswordReset$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.firstTimePasswordResetSuccess.type);
        expect(notificationService.success).toHaveBeenCalledWith(
          'Password has been updated successfully'
        );
        done();
      });
    });

    it('should dispatch firstTimePasswordResetFailure on reset error', done => {
      const payload = {
        email: 'test@example.com',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      const error = new Error('Reset failed');
      authService.firstTimePasswordReset.mockReturnValue(throwError(() => error));

      actions$ = of(AuthActions.firstTimePasswordReset(payload));

      effects.firstTimePasswordReset$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.firstTimePasswordResetFailure.type);
        expect(action.error).toEqual('Reset failed');
        expect(notificationService.error).toHaveBeenCalled();
        done();
      });
    });

    it('should show specialized error message for password validation errors', done => {
      const payload = {
        email: 'test@example.com',
        password: 'newPassword',
        confirmPassword: 'newPassword',
      };

      const error = new Error('Invalid password format');
      authService.firstTimePasswordReset.mockReturnValue(throwError(() => error));

      actions$ = of(AuthActions.firstTimePasswordReset(payload));

      effects.firstTimePasswordReset$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.firstTimePasswordResetFailure.type);
        expect(console.error).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('firstTimePasswordResetSuccess$', () => {
    it('should navigate to login page', () => {
      actions$ = of(AuthActions.firstTimePasswordResetSuccess());

      effects.firstTimePasswordResetSuccess$.subscribe(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    });
  });

  describe('logout$', () => {
    it('should call authService.logout and navigate to login page', () => {
      // Mock router url for protected route
      Object.defineProperty(router, 'url', { get: () => '/admin/dashboard' });

      actions$ = of(AuthActions.logout());

      effects.logout$.subscribe(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
          queryParams: { returnUrl: '/admin/dashboard' },
        });
        expect(notificationService.warning).toHaveBeenCalled();
      });
    });

    it('should show different message for manual logout', () => {
      // Mock router url for non-protected route
      Object.defineProperty(router, 'url', { get: () => '/auth/profile' });

      actions$ = of(AuthActions.logout());

      effects.logout$.subscribe(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
        expect(notificationService.info).toHaveBeenCalledWith('You have been logged out');
      });
    });
  });

  describe('forgotPassword$', () => {
    it('should dispatch forgotPasswordSuccess on successful request', done => {
      const email = 'test@example.com';

      authService.requestPasswordReset.mockReturnValue(of('Success'));

      actions$ = of(AuthActions.forgotPassword({ email }));

      effects.forgotPassword$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.forgotPasswordSuccess.type);
        expect(notificationService.success).toHaveBeenCalledWith(
          'Password reset instructions sent to your email'
        );
        done();
      });
    });

    it('should dispatch forgotPasswordFailure on request error', done => {
      const email = 'test@example.com';

      const error = new Error('Request failed');
      authService.requestPasswordReset.mockReturnValue(throwError(() => error));

      actions$ = of(AuthActions.forgotPassword({ email }));

      effects.forgotPassword$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.forgotPasswordFailure.type);
        expect(action.error).toEqual('Request failed');
        done();
      });
    });
  });

  describe('forgotPasswordSuccess$', () => {
    it('should dispatch setAuthStep with OTP step', done => {
      actions$ = of(AuthActions.forgotPasswordSuccess());

      effects.forgotPasswordSuccess$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toEqual(AuthActions.setAuthStep.type);
        expect(action.step).toEqual(AuthStep.OTP);
        done();
      });
    });
  });
});
