export const AuthStep = {
  EMAIL: 'EMAIL',
  OTP: 'OTP',
  RESET_PASSWORD: 'RESET_PASSWORD',
} as const;

export type AuthStep = (typeof AuthStep)[keyof typeof AuthStep];

export type UserRole = 'ADMIN' | 'FACILITATOR' | 'NSP' | 'RECEPTIONIST';

export interface User {
  id: string | null;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  passwordResetRequired: boolean;
  role: UserRole;
  email: string; // Added email property to fix the type error
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface CreateUserRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
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
