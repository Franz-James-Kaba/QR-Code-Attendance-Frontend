export const AuthStep = {
  EMAIL: 'EMAIL',
  OTP: 'OTP',
  RESET_PASSWORD: 'RESET_PASSWORD',
} as const;

export type AuthStep = (typeof AuthStep)[keyof typeof AuthStep];

export type UserRole = 'ADMIN' | 'FACILITATOR' | 'NSP' | 'RECEPTIONIST' | string;

export interface User {
  id: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  email: string | null;
  role: UserRole;
  passwordResetRequired: boolean;
  firstName?: string;
  lastName?: string;
  checkedIn?: boolean;
}

export interface ExtendedAuthResponse extends AuthResponse {
  firstName?: string;
  lastName?: string;
  checkedIn?: boolean;
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
  token: string | null;
  user: {
    id: string | null;
    email: string;
    role: UserRole | null;
    firstName: string;
    lastName: string;
  } | null;
  email: string | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  currentStep: AuthStep;
  otpVerified: boolean;
  passwordResetRequired: boolean;
}

export const initialAuthState: AuthState = {
  token: null,
  user: null,
  email: null,
  isLoading: false,
  error: null,
  successMessage: null,
  currentStep: AuthStep.EMAIL,
  otpVerified: false,
  passwordResetRequired: false,
};
