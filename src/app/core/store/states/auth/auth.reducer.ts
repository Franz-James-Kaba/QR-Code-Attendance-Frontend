import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from '@shared/models/auth/auth.model';

import { AuthActions } from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.initAuthSuccess, (state, { token }) => ({
    ...state,
    token: token,
  })),

  on(AuthActions.login, state => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    token: response.token,
    passwordResetRequired: response.passwordResetRequired,
    user: {
      role: response.role,
      id: null, // These will be populated by user profile if needed
      email: state.email ?? '',
      firstName: '',
      lastName: ''
    },
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.logout, () => ({
    ...initialAuthState
  })),

  on(AuthActions.resetPassword, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.resetPasswordSuccess, state => ({
    ...state,
    passwordResetRequired: false,
    isLoading: false,
    error: null,
    successMessage: 'Password has been reset successfully',
  })),

  on(AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.firstTimePasswordReset, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.clearError, state => ({
    ...state,
    error: null,
  })),

  on(AuthActions.setSuccessMessage, (state, { message }) => ({
    ...state,
    successMessage: message,
  })),

  on(AuthActions.clearSuccessMessage, state => ({
    ...state,
    successMessage: null,
  })),

  on(AuthActions.forgotPassword, state => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.forgotPasswordSuccess, state => ({
    ...state,
    isLoading: false,
    error: null,
    successMessage: 'Password reset instructions sent to your email',
  })),

  on(AuthActions.forgotPasswordFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.setAuthStep, (state, { step }) => ({
    ...state,
    currentStep: step,
  })),

  on(AuthActions.setEmail, (state, { email }) => ({
    ...state,
    email,
  })),

  on(AuthActions.verifyOtpSuccess, state => ({
    ...state,
    otpVerified: true,
    error: null,
  })),

  on(AuthActions.verifyOtpFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
