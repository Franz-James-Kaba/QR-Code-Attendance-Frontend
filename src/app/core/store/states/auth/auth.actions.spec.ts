import { AuthResponse, AuthStep } from '@shared/models/auth/auth.model';

import { AuthActions } from './auth.actions';

describe('Auth Actions', () => {
  describe('initAuth actions', () => {
    it('should create an initAuth action', () => {
      const action = AuthActions.initAuth();
      expect(action.type).toEqual('[Auth] Initialize Auth');
    });

    it('should create an initAuthSuccess action', () => {
      const token = 'test-token';
      const action = AuthActions.initAuthSuccess({ token });
      expect(action.type).toEqual('[Auth] Initialize Auth Success');
      expect(action.token).toEqual(token);
    });
  });

  describe('login actions', () => {
    it('should create a login action', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password'
      };
      const action = AuthActions.login(credentials);
      expect(action.type).toEqual('[Auth] Login');
      expect(action.email).toEqual(credentials.email);
      expect(action.password).toEqual(credentials.password);
    });

    it('should create a loginSuccess action', () => {
      const response: AuthResponse = {
        token: 'test-token',
        passwordResetRequired: false,
        role: 'ADMIN',
        email: 'test@example.com'
      };
      const action = AuthActions.loginSuccess({ response });
      expect(action.type).toEqual('[Auth] Login Success');
      expect(action.response).toEqual(response);
    });

    it('should create a loginFailure action', () => {
      const error = 'Invalid credentials';
      const action = AuthActions.loginFailure({ error });
      expect(action.type).toEqual('[Auth] Login Failure');
      expect(action.error).toEqual(error);
    });
  });

  describe('logout action', () => {
    it('should create a logout action', () => {
      const action = AuthActions.logout();
      expect(action.type).toEqual('[Auth] Logout');
    });
  });

  describe('resetPassword actions', () => {
    it('should create a resetPassword action', () => {
      const payload = {
        email: 'test@example.com',
        token: 'reset-token',
        password: 'newPassword',
        confirmPassword: 'newPassword'
      };
      const action = AuthActions.resetPassword(payload);
      expect(action.type).toEqual('[Auth] Reset Password');
      expect(action.email).toEqual(payload.email);
      expect(action.token).toEqual(payload.token);
      expect(action.password).toEqual(payload.password);
      expect(action.confirmPassword).toEqual(payload.confirmPassword);
    });

    it('should create a resetPasswordSuccess action', () => {
      const action = AuthActions.resetPasswordSuccess();
      expect(action.type).toEqual('[Auth] Reset Password Success');
    });

    it('should create a resetPasswordFailure action', () => {
      const error = 'Reset password failed';
      const action = AuthActions.resetPasswordFailure({ error });
      expect(action.type).toEqual('[Auth] Reset Password Failure');
      expect(action.error).toEqual(error);
    });
  });

  describe('firstTimePasswordReset actions', () => {
    it('should create a firstTimePasswordReset action', () => {
      const payload = {
        email: 'test@example.com',
        password: 'newPassword',
        confirmPassword: 'newPassword'
      };
      const action = AuthActions.firstTimePasswordReset(payload);
      expect(action.type).toEqual('[Auth] First Time Password Reset');
      expect(action.email).toEqual(payload.email);
      expect(action.password).toEqual(payload.password);
      expect(action.confirmPassword).toEqual(payload.confirmPassword);
    });

    it('should create a firstTimePasswordResetSuccess action', () => {
      const action = AuthActions.firstTimePasswordResetSuccess();
      expect(action.type).toEqual('[Auth] First Time Password Reset Success');
    });

    it('should create a firstTimePasswordResetFailure action', () => {
      const error = 'Reset password failed';
      const action = AuthActions.firstTimePasswordResetFailure({ error });
      expect(action.type).toEqual('[Auth] First Time Password Reset Failure');
      expect(action.error).toEqual(error);
    });
  });

  describe('error and success message actions', () => {
    it('should create a clearError action', () => {
      const action = AuthActions.clearError();
      expect(action.type).toEqual('[Auth] Clear Error');
    });

    it('should create a setSuccessMessage action', () => {
      const message = 'Operation successful';
      const action = AuthActions.setSuccessMessage({ message });
      expect(action.type).toEqual('[Auth] Set Success Message');
      expect(action.message).toEqual(message);
    });

    it('should create a clearSuccessMessage action', () => {
      const action = AuthActions.clearSuccessMessage();
      expect(action.type).toEqual('[Auth] Clear Success Message');
    });
  });

  describe('forgotPassword actions', () => {
    it('should create a forgotPassword action', () => {
      const email = 'test@example.com';
      const action = AuthActions.forgotPassword({ email });
      expect(action.type).toEqual('[Auth] Forgot Password');
      expect(action.email).toEqual(email);
    });

    it('should create a forgotPasswordSuccess action', () => {
      const action = AuthActions.forgotPasswordSuccess();
      expect(action.type).toEqual('[Auth] Forgot Password Success');
    });

    it('should create a forgotPasswordFailure action', () => {
      const error = 'Forgot password request failed';
      const action = AuthActions.forgotPasswordFailure({ error });
      expect(action.type).toEqual('[Auth] Forgot Password Failure');
      expect(action.error).toEqual(error);
    });
  });

  describe('OTP verification actions', () => {
    it('should create a verifyOtp action', () => {
      const otp = '123456';
      const action = AuthActions.verifyOtp({ otp });
      expect(action.type).toEqual('[Auth] Verify OTP');
      expect(action.otp).toEqual(otp);
    });

    it('should create a verifyOtpSuccess action', () => {
      const action = AuthActions.verifyOtpSuccess();
      expect(action.type).toEqual('[Auth] Verify OTP Success');
    });

    it('should create a verifyOtpFailure action', () => {
      const error = 'Invalid OTP';
      const action = AuthActions.verifyOtpFailure({ error });
      expect(action.type).toEqual('[Auth] Verify OTP Failure');
      expect(action.error).toEqual(error);
    });
  });

  describe('auth step actions', () => {
    it('should create a setAuthStep action', () => {
      const step = AuthStep.OTP;
      const action = AuthActions.setAuthStep({ step });
      expect(action.type).toEqual('[Auth] Set Auth Step');
      expect(action.step).toEqual(step);
    });

    it('should create a setEmail action', () => {
      const email = 'test@example.com';
      const action = AuthActions.setEmail({ email });
      expect(action.type).toEqual('[Auth] Set Email');
      expect(action.email).toEqual(email);
    });
  });
});
