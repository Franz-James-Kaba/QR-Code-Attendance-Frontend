import { createAction, props } from '@ngrx/store';
import { AuthResponse, AuthStep } from '@shared/models/auth/auth.model';

export const AuthActions = {
  initAuth: createAction('[Auth] Initialize Auth'),
  initAuthSuccess: createAction('[Auth] Initialize Auth Success', props<{ token: string }>()),

  login: createAction('[Auth] Login', props<{ email: string; password: string }>()),
  loginSuccess: createAction('[Auth] Login Success', props<{ response: AuthResponse }>()),
  loginFailure: createAction('[Auth] Login Failure', props<{ error: string }>()),

  logout: createAction('[Auth] Logout'),

  resetPassword: createAction(
    '[Auth] Reset Password',
    props<{
      email: string;
      token: string;
      password: string;
      confirmPassword: string;
    }>()
  ),
  resetPasswordSuccess: createAction('[Auth] Reset Password Success'),
  resetPasswordFailure: createAction('[Auth] Reset Password Failure', props<{ error: string }>()),

  firstTimePasswordReset: createAction(
    '[Auth] First Time Password Reset',
    props<{
      email: string;
      password: string;
      confirmPassword: string;
    }>()
  ),

  firstTimePasswordResetSuccess: createAction('[Auth] First Time Password Reset Success'),
  firstTimePasswordResetFailure: createAction(
    '[Auth] First Time Password Reset Failure',
    props<{ error: string }>()
  ),

  clearError: createAction('[Auth] Clear Error'),
  setSuccessMessage: createAction('[Auth] Set Success Message', props<{ message: string }>()),
  clearSuccessMessage: createAction('[Auth] Clear Success Message'),

  forgotPassword: createAction('[Auth] Forgot Password', props<{ email: string }>()),
  forgotPasswordSuccess: createAction('[Auth] Forgot Password Success'),
  forgotPasswordFailure: createAction('[Auth] Forgot Password Failure', props<{ error: string }>()),

  verifyOtp: createAction('[Auth] Verify OTP', props<{ otp: string }>()),
  verifyOtpSuccess: createAction('[Auth] Verify OTP Success'),
  verifyOtpFailure: createAction('[Auth] Verify OTP Failure', props<{ error: string }>()),

  setAuthStep: createAction('[Auth] Set Auth Step', props<{ step: AuthStep }>()),
  setEmail: createAction('[Auth] Set Email', props<{ email: string }>()),
};
