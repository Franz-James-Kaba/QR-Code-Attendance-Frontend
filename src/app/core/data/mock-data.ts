import { AuthResponse, AuthStep, User } from '@shared/models/auth/auth.model';

// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  NSP = 'NSP',
  FACILITATOR = 'FACILITATOR'
}

// Mock users with different roles and states
export const MOCK_USERS: Record<string, User & { password: string; passwordResetRequired: boolean }> = {
  'admin@amalitech.com': {
    id: 'admin-001',
    email: 'admin@amalitech.com',
    role: UserRole.ADMIN,
    password: 'Admin@123',
    passwordResetRequired: false
  },
  'nsp@amalitech.com': {
    id: 'nsp-001',
    email: 'nsp@amalitech.com',
    role: UserRole.NSP,
    password: 'Nsp@123',
    passwordResetRequired: true // This user needs to reset password
  },
  'facilitator@amalitech.com': {
    id: 'facilitator-001',
    email: 'facilitator@amalitech.com',
    role: UserRole.FACILITATOR,
    password: 'Facilitator@123',
    passwordResetRequired: false
  },
  'new-user@amalitech.com': {
    id: 'new-user-001',
    email: 'new-user@amalitech.com',
    role: UserRole.FACILITATOR,
    password: 'NewUser@123',
    passwordResetRequired: true
  }
};

// Valid OTP for all users
export const VALID_OTP = '123456';

// Auth tokens (in a real app, these would be JWTs)
export const generateMockToken = (userId: string): string => {
  return `mock-jwt-token-${userId}-${Date.now()}`;
};

// Generate mock auth response based on user
export const generateAuthResponse = (user: User & { passwordResetRequired: boolean }): AuthResponse => {
  const { id, email, role, passwordResetRequired } = user;
  return {
    user: { id, email, role },
    token: generateMockToken(id),
    passwordResetRequired
  };
};

// Simulate common API errors
export const API_ERRORS = {
  invalidCredentials: 'Invalid email or password',
  accountLocked: 'Your account has been locked. Please contact support',
  serverError: 'Server error. Please try again later',
  invalidOtp: 'Invalid verification code',
  expiredOtp: 'Verification code has expired. Please request a new one',
  networkError: 'Network error. Please check your connection',
  oldPasswordIncorrect: 'Current password is incorrect',
  passwordMismatch: 'Passwords do not match',
  unauthorizedAccess: 'You are not authorized to access this resource',
  sessionExpired: 'Your session has expired. Please log in again'
};

// Dashboard data by role
export const DASHBOARD_DATA = {
  [UserRole.ADMIN]: {
    stats: {
      totalNSPs: 12,
      totalFacilitators: 48,
      activeTrainees: 256,
      upcomingEvents: 8
    },
    recentActivities: [
      { id: 'act-1', description: 'New NSP onboarded', timestamp: '2023-06-10T09:30:00' },
      { id: 'act-2', description: 'System update completed', timestamp: '2023-06-09T14:15:00' },
      { id: 'act-3', description: 'New facilitator registered', timestamp: '2023-06-08T11:45:00' }
    ]
  },
  [UserRole.NSP]: {
    stats: {
      totalFacilitators: 16,
      activeTrainees: 98,
      upcomingEvents: 5,
      completedCourses: 12
    },
    recentActivities: [
      { id: 'act-1', description: 'New training session scheduled', timestamp: '2023-06-10T10:30:00' },
      { id: 'act-2', description: 'Attendance report generated', timestamp: '2023-06-09T15:20:00' },
      { id: 'act-3', description: 'New facilitator added', timestamp: '2023-06-08T13:10:00' }
    ]
  },
  [UserRole.FACILITATOR]: {
    stats: {
      activeTrainees: 42,
      upcomingSessions: 3,
      attendanceRate: '92%',
      pendingApprovals: 7
    },
    recentActivities: [
      { id: 'act-1', description: 'Training session completed', timestamp: '2023-06-10T12:00:00' },
      { id: 'act-2', description: 'QR code generated for session', timestamp: '2023-06-09T09:45:00' },
      { id: 'act-3', description: 'Attendance report submitted', timestamp: '2023-06-08T16:30:00' }
    ]
  }
};

// Mock temporary storage (simulates backend session storage)
export class MockStorage {
  private static emailOtpMap: Record<string, { otp: string; expires: number }> = {};
  private static passwordResetRequests: Record<string, { requested: number; completed: boolean }> = {};

  static storeOtp(email: string, otp: string = VALID_OTP): void {
    // OTP expires in 10 minutes
    const expires = Date.now() + 10 * 60 * 1000;
    this.emailOtpMap[email] = { otp, expires };
  }

  static verifyOtp(email: string, otp: string): boolean {
    const record = this.emailOtpMap[email];
    if (!record) return false;
    if (Date.now() > record.expires) return false;
    return record.otp === otp;
  }

  static recordPasswordResetRequest(email: string): void {
    this.passwordResetRequests[email] = {
      requested: Date.now(),
      completed: false
    };
  }

  static completePasswordReset(email: string): void {
    if (this.passwordResetRequests[email]) {
      this.passwordResetRequests[email].completed = true;

      // Also update the user's passwordResetRequired flag if they exist
      if (MOCK_USERS[email]) {
        MOCK_USERS[email].passwordResetRequired = false;
      }
    }
  }

  static clearOtp(email: string): void {
    delete this.emailOtpMap[email];
  }
}
