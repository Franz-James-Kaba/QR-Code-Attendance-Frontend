// auth.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '@shared/models/auth.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => !!state.token
);

export const selectPasswordResetRequired = createSelector(
  selectAuthState,
  (state) => state.passwordResetRequired
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectSuccessMessage = createSelector(
  selectAuthState,
  (state) => state.successMessage
);

export const selectAuthStep = createSelector(
  selectAuthState,
  (state) => state.currentStep
);

export const selectEmail = createSelector(
  selectAuthState,
  (state) => state.email
);

export const selectOtpVerified = createSelector(
  selectAuthState,
  (state) => state.otpVerified
);
