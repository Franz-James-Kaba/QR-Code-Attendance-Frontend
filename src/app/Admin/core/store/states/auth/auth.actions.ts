import { AuthResponse, AuthStep } from '@app/shared/models/auth.model';
import { createAction,  props } from '@ngrx/store';

export const AuthActions = {
  login: createAction('[Auth] Login', props<{ email: string; password: string }>()),
  loginSuccess: createAction('[Auth] Login Success', props<{ response: AuthResponse }>()),
  loginFailure: createAction('[Auth] Login Failure', props<{ error: string }>()),
  logout: createAction('[Auth] Logout'),
  resetPassword: createAction('[Auth] Reset Password', props<{ oldPassword: string; newPassword: string }>()),
  resetPasswordSuccess: createAction('[Auth] Reset Password Success'),
  resetPasswordFailure: createAction('[Auth] Reset Password Failure', props<{ error: string }>()),
  clearError: createAction('[Auth] Clear Error'),
  forgotPassword: createAction('[Auth] Forgot Password', props<{ email: string }>()),
  forgotPasswordSuccess: createAction('[Auth] Forgot Password Success'),
  forgotPasswordFailure: createAction('[Auth] Forgot Password Failure', props<{ error: string }>()),
  verifyOtp: createAction('[Auth] Verify OTP', props<{ otp: string }>()),
  verifyOtpSuccess: createAction('[Auth] Verify OTP Success'),
  verifyOtpFailure: createAction('[Auth] Verify OTP Failure', props<{ error: string }>()),
  setAuthStep: createAction('[Auth] Set Auth Step', props<{ step: AuthStep }>())
};
