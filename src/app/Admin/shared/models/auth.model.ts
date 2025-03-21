export enum AuthStep {
  EMAIL = 'EMAIL',
  OTP = 'OTP',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  passwordResetRequired: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  passwordResetRequired: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  currentStep: AuthStep;
  email: string | null;
  otpVerified: boolean;
}

export const initialAuthState: AuthState = {
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
