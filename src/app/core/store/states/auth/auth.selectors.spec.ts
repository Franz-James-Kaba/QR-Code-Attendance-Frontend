import { AuthState, initialAuthState, AuthStep } from '@shared/models/auth/auth.model';

import * as fromSelectors from './auth.selectors';

describe('Auth Selectors', () => {
  const createAuthState = (authState: Partial<AuthState>): { auth: AuthState } => ({
    auth: {
      ...initialAuthState,
      ...authState
    }
  });

  describe('selectAuthState', () => {
    it('should select the auth state', () => {
      const state = createAuthState({});
      const result = fromSelectors.selectAuthState(state);
      expect(result).toEqual(state.auth);
    });
  });

  describe('selectUser', () => {
    it('should return null when no user is in state', () => {
      const state = createAuthState({ user: null });
      const result = fromSelectors.selectUser(state);
      expect(result).toBeNull();
    });

    it('should return user object when available', () => {
      const user = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'ADMIN' as const
      };
      const state = createAuthState({ user });
      const result = fromSelectors.selectUser(state);
      expect(result).toEqual(user);
    });
  });

  describe('selectIsAuthenticated', () => {
    it('should return false when token is null', () => {
      const state = createAuthState({ token: null });
      const result = fromSelectors.selectIsAuthenticated(state);
      expect(result).toBe(false);
    });

    it('should return false when token is empty string', () => {
      const state = createAuthState({ token: '' });
      const result = fromSelectors.selectIsAuthenticated(state);
      expect(result).toBe(false);
    });

    it('should return true when token is present', () => {
      const state = createAuthState({ token: 'valid-token' });
      const result = fromSelectors.selectIsAuthenticated(state);
      expect(result).toBe(true);
    });
  });

  describe('selectPasswordResetRequired', () => {
    it('should return passwordResetRequired boolean value', () => {
      const state = createAuthState({ passwordResetRequired: true });
      const result = fromSelectors.selectPasswordResetRequired(state);
      expect(result).toBe(true);
    });
  });

  describe('selectAuthError', () => {
    it('should return null when no error', () => {
      const state = createAuthState({ error: null });
      const result = fromSelectors.selectAuthError(state);
      expect(result).toBeNull();
    });

    it('should return error string when error exists', () => {
      const errorMessage = 'Authentication failed';
      const state = createAuthState({ error: errorMessage });
      const result = fromSelectors.selectAuthError(state);
      expect(result).toBe(errorMessage);
    });
  });

  describe('selectIsLoading', () => {
    it('should return isLoading boolean value', () => {
      const state = createAuthState({ isLoading: true });
      const result = fromSelectors.selectIsLoading(state);
      expect(result).toBe(true);
    });
  });

  describe('selectSuccessMessage', () => {
    it('should return null when no success message', () => {
      const state = createAuthState({ successMessage: null });
      const result = fromSelectors.selectSuccessMessage(state);
      expect(result).toBeNull();
    });

    it('should return success message when it exists', () => {
      const message = 'Operation successful';
      const state = createAuthState({ successMessage: message });
      const result = fromSelectors.selectSuccessMessage(state);
      expect(result).toBe(message);
    });
  });

  describe('selectAuthStep', () => {
    it('should return current auth step', () => {
      const step = AuthStep.OTP;
      const state = createAuthState({ currentStep: step });
      const result = fromSelectors.selectAuthStep(state);
      expect(result).toBe(step);
    });
  });

  describe('selectEmail', () => {
    it('should return null when no email', () => {
      const state = createAuthState({ email: null });
      const result = fromSelectors.selectEmail(state);
      expect(result).toBeNull();
    });

    it('should return email when it exists', () => {
      const email = 'test@example.com';
      const state = createAuthState({ email });
      const result = fromSelectors.selectEmail(state);
      expect(result).toBe(email);
    });
  });

  describe('selectOtpVerified', () => {
    it('should return otpVerified boolean value', () => {
      const state = createAuthState({ otpVerified: true });
      const result = fromSelectors.selectOtpVerified(state);
      expect(result).toBe(true);
    });
  });

  describe('selectCurrentUserRole', () => {
    it('should return null when no user', () => {
      const state = createAuthState({ user: null });
      const result = fromSelectors.selectCurrentUserRole(state);
      expect(result).toBeNull();
    });

    it('should return user role when user exists', () => {
      const role = 'ADMIN' as const;
      const state = createAuthState({
        user: {
          id: '1',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          role
        }
      });
      const result = fromSelectors.selectCurrentUserRole(state);
      expect(result).toBe(role);
    });
  });
});
