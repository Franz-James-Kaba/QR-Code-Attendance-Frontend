import { AuthState, initialAuthState, AuthStep } from '@shared/models/auth/auth.model';

import { AuthActions } from './auth.actions';
import { authReducer } from './auth.reducer';

describe('Auth Reducer', () => {
  describe('an unknown action', () => {
    it('should return the default state for unknown action', () => {
      const action = { type: 'Unknown' };
      const state = authReducer(initialAuthState, action);

      expect(state).toBe(initialAuthState);
    });
  });

  describe('initAuthSuccess action', () => {
    it('should update token in state', () => {
      const token = 'test-token';
      const action = AuthActions.initAuthSuccess({ token });
      const state = authReducer(initialAuthState, action);

      expect(state.token).toBe(token);
      expect(state).not.toBe(initialAuthState);
    });
  });

  describe('login action', () => {
    it('should set isLoading to true and clear error', () => {
      const initialStateWithError: AuthState = {
        ...initialAuthState,
        error: 'Previous error',
        isLoading: false
      };

      const action = AuthActions.login({ email: 'test@example.com', password: 'password' });
      const state = authReducer(initialStateWithError, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('loginSuccess action', () => {
    it('should update state with auth response data', () => {
      const response = {
        token: 'test-token',
        passwordResetRequired: false,
        role: 'ADMIN' as const,
        email: 'test@example.com'
      };

      const action = AuthActions.loginSuccess({ response });
      const state = authReducer(initialAuthState, action);

      expect(state.token).toBe(response.token);
      expect(state.passwordResetRequired).toBe(response.passwordResetRequired);
      expect(state.user?.role).toBe(response.role);
      expect(state.user?.email).toBe(response.email);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should use email from state if not provided in response', () => {
      const stateWithEmail: AuthState = {
        ...initialAuthState,
        email: 'email-in-state@example.com'
      };

      const response = {
        token: 'test-token',
        passwordResetRequired: false,
        role: 'ADMIN' as const,
        email: 'email-in-state@example.com'
      };

      const action = AuthActions.loginSuccess({ response });
      const state = authReducer(stateWithEmail, action);

      expect(state.user?.email).toBe(stateWithEmail.email);
    });
  });

  describe('loginFailure action', () => {
    it('should set error and set isLoading to false', () => {
      const error = 'Login failed';
      const initialStateLoading: AuthState = {
        ...initialAuthState,
        isLoading: true
      };

      const action = AuthActions.loginFailure({ error });
      const state = authReducer(initialStateLoading, action);

      expect(state.error).toBe(error);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout action', () => {
    it('should reset state to initial values', () => {
      const currentState: AuthState = {
        ...initialAuthState,
        token: 'test-token',
        user: {
          id: '1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          role: 'ADMIN'
        },
        isLoading: false,
        error: null
      };

      const action = AuthActions.logout();
      const state = authReducer(currentState, action);

      expect(state).toEqual(initialAuthState);
    });
  });

  describe('resetPassword action', () => {
    it('should set isLoading to true and clear error', () => {
      const initialStateWithError: AuthState = {
        ...initialAuthState,
        error: 'Previous error',
        isLoading: false
      };

      const action = AuthActions.resetPassword({
        email: 'test@example.com',
        token: 'reset-token',
        password: 'newpassword',
        confirmPassword: 'newpassword'
      });
      const state = authReducer(initialStateWithError, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('resetPasswordSuccess action', () => {
    it('should update state on successful password reset', () => {
      const initialStateResetting: AuthState = {
        ...initialAuthState,
        passwordResetRequired: true,
        isLoading: true
      };

      const action = AuthActions.resetPasswordSuccess();
      const state = authReducer(initialStateResetting, action);

      expect(state.passwordResetRequired).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.successMessage).toBe('Password has been reset successfully');
    });
  });

  describe('resetPasswordFailure action', () => {
    it('should set error and set isLoading to false', () => {
      const error = 'Reset failed';
      const initialStateLoading: AuthState = {
        ...initialAuthState,
        isLoading: true
      };

      const action = AuthActions.resetPasswordFailure({ error });
      const state = authReducer(initialStateLoading, action);

      expect(state.error).toBe(error);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('firstTimePasswordReset action', () => {
    it('should set isLoading to true and clear error', () => {
      const initialStateWithError: AuthState = {
        ...initialAuthState,
        error: 'Previous error',
        isLoading: false
      };

      const action = AuthActions.firstTimePasswordReset({
        email: 'test@example.com',
        password: 'newpassword',
        confirmPassword: 'newpassword'
      });
      const state = authReducer(initialStateWithError, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('firstTimePasswordResetSuccess action', () => {
    it('should update state on successful first-time password reset', () => {
      const initialStateResetting: AuthState = {
        ...initialAuthState,
        passwordResetRequired: true,
        isLoading: true
      };

      const action = AuthActions.firstTimePasswordResetSuccess();
      const state = authReducer(initialStateResetting, action);

      expect(state.passwordResetRequired).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.successMessage).toBe('Your password has been updated successfully. Please login with your new password.');
    });
  });

  describe('firstTimePasswordResetFailure action', () => {
    it('should set error and set isLoading to false', () => {
      const error = 'Reset failed';
      const initialStateLoading: AuthState = {
        ...initialAuthState,
        isLoading: true
      };

      const action = AuthActions.firstTimePasswordResetFailure({ error });
      const state = authReducer(initialStateLoading, action);

      expect(state.error).toBe(error);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('clearError action', () => {
    it('should clear error in state', () => {
      const initialStateWithError: AuthState = {
        ...initialAuthState,
        error: 'Some error'
      };

      const action = AuthActions.clearError();
      const state = authReducer(initialStateWithError, action);

      expect(state.error).toBeNull();
    });
  });

  describe('setSuccessMessage action', () => {
    it('should set success message in state', () => {
      const message = 'Operation successful';
      const action = AuthActions.setSuccessMessage({ message });
      const state = authReducer(initialAuthState, action);

      expect(state.successMessage).toBe(message);
    });
  });

  describe('clearSuccessMessage action', () => {
    it('should clear success message in state', () => {
      const initialStateWithMessage: AuthState = {
        ...initialAuthState,
        successMessage: 'Success message'
      };

      const action = AuthActions.clearSuccessMessage();
      const state = authReducer(initialStateWithMessage, action);

      expect(state.successMessage).toBeNull();
    });
  });

  describe('forgotPassword action', () => {
    it('should set isLoading to true and clear error', () => {
      const initialStateWithError: AuthState = {
        ...initialAuthState,
        error: 'Previous error',
        isLoading: false
      };

      const action = AuthActions.forgotPassword({ email: 'test@example.com' });
      const state = authReducer(initialStateWithError, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('forgotPasswordSuccess action', () => {
    it('should update state on successful forgot password request', () => {
      const initialStateLoading: AuthState = {
        ...initialAuthState,
        isLoading: true
      };

      const action = AuthActions.forgotPasswordSuccess();
      const state = authReducer(initialStateLoading, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.successMessage).toBe('Password reset instructions sent to your email');
    });
  });

  describe('forgotPasswordFailure action', () => {
    it('should set error and set isLoading to false', () => {
      const error = 'Request failed';
      const initialStateLoading: AuthState = {
        ...initialAuthState,
        isLoading: true
      };

      const action = AuthActions.forgotPasswordFailure({ error });
      const state = authReducer(initialStateLoading, action);

      expect(state.error).toBe(error);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setAuthStep action', () => {
    it('should update current auth step', () => {
      const step = AuthStep.OTP;
      const action = AuthActions.setAuthStep({ step });
      const state = authReducer(initialAuthState, action);

      expect(state.currentStep).toBe(step);
    });
  });

  describe('setEmail action', () => {
    it('should update email in state', () => {
      const email = 'test@example.com';
      const action = AuthActions.setEmail({ email });
      const state = authReducer(initialAuthState, action);

      expect(state.email).toBe(email);
    });
  });

  describe('verifyOtpSuccess action', () => {
    it('should set otpVerified to true and clear error', () => {
      const initialStateWithError: AuthState = {
        ...initialAuthState,
        otpVerified: false,
        error: 'Previous error'
      };

      const action = AuthActions.verifyOtpSuccess();
      const state = authReducer(initialStateWithError, action);

      expect(state.otpVerified).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('verifyOtpFailure action', () => {
    it('should set error', () => {
      const error = 'Invalid OTP';
      const action = AuthActions.verifyOtpFailure({ error });
      const state = authReducer(initialAuthState, action);

      expect(state.error).toBe(error);
    });
  });
});
