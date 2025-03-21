import { createReducer, on } from '@ngrx/store';
import { AuthState, AuthStep } from '@shared/models/auth.model';
import { AuthActions } from './auth.actions';

const initialState: AuthState = {
  user: null,
  token: null,
  passwordResetRequired: false,
  isLoading: false,
  error: null,
  successMessage: null,
  currentStep: AuthStep.EMAIL,
  email: null,
  otpVerified: false,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.token,
    passwordResetRequired: response.passwordResetRequired,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.logout, () => initialState),

  on(AuthActions.resetPasswordSuccess, (state) => ({
    ...state,
    passwordResetRequired: false,
    error: null,
  })),

  on(AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
  })),

  on(AuthActions.forgotPassword, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.forgotPasswordSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
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

  on(AuthActions.verifyOtpSuccess, (state) => ({
    ...state,
    otpVerified: true,
    error: null,
  })),

  on(AuthActions.verifyOtpFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
