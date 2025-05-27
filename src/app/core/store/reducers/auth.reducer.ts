import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from '@shared/models/auth/auth.model';
import { AuthActions } from '@store/actions/auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, state => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: {
      id: null,
      firstName: '',
      lastName: '',
      email: response.email ?? state.email ?? '',
      role: response.role,
      passwordResetRequired: response.passwordResetRequired,
    },
    passwordResetRequired: response.passwordResetRequired,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.logout, () => ({
    ...initialAuthState,
  })),

  on(AuthActions.resetPassword, state => ({
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

  on(AuthActions.firstTimePasswordReset, state => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.firstTimePasswordResetSuccess, state => ({
    ...state,
    passwordResetRequired: false,
    isLoading: false,
    error: null,
    successMessage:
      'Your password has been updated successfully. Please login with your new password.',
  })),

  on(AuthActions.firstTimePasswordResetFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
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
  })),

  on(AuthActions.fetchUserProfile, state => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.fetchUserProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.fetchUserProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.updateUserCheckedIn, (state, { checkedIn }) => ({
    ...state,
    user: state.user
      ? {
          ...state.user,
          checkedIn,
        }
      : null,
  })),
);
