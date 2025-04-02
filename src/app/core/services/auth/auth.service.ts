import { Injectable } from '@angular/core';
import {
  MOCK_USERS,
  MockStorage,
  generateAuthResponse,
  API_ERRORS,
  VALID_OTP
} from '@core/data/mock-data';
import { AuthResponse, LoginCredentials } from '@shared/models/auth/auth.model';
import { Observable, throwError, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'api/auth';
  private currentUserEmail: string | null = null;

  constructor() {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const { email, password } = credentials;

    // Simulate network delay
    return new Observable<AuthResponse>((observer: Observer<AuthResponse>) => {
      // Add delay to simulate network
      setTimeout(() => {
        // Check if user exists
        const user = MOCK_USERS[email];

        if (!user) {
          observer.error(new Error(API_ERRORS.invalidCredentials));
          return;
        }

        // Validate password
        if (user.password !== password) {
          observer.error(new Error(API_ERRORS.invalidCredentials));
          return;
        }

        // Store current user email for other operations
        this.currentUserEmail = email;

        // Generate auth response
        const response = generateAuthResponse(user);
        observer.next(response);
        observer.complete();
      }, 800 + Math.random() * 800);
    });
  }

  resetPassword(oldPassword: string, newPassword: string): Observable<void> {
    if (!this.currentUserEmail) {
      return throwError(() => new Error('No active user session'));
    }

    return new Observable<void>((observer: Observer<void>) => {
      setTimeout(() => {
        const user = MOCK_USERS[this.currentUserEmail!];

        // If resetting with old password, verify it
        if (oldPassword && oldPassword !== user.password) {
          observer.error(new Error(API_ERRORS.oldPasswordIncorrect));
          return;
        }

        // Update the password
        MOCK_USERS[this.currentUserEmail!].password = newPassword;

        // Mark password reset as completed
        MockStorage.completePasswordReset(this.currentUserEmail!);

        // Update user state
        MOCK_USERS[this.currentUserEmail!].passwordResetRequired = false;

        observer.next();
        observer.complete();
      }, 1000 + Math.random() * 500);
    });
  }

  verifyOtp(otp: string): Observable<void> {
    if (!this.currentUserEmail) {
      return throwError(() => new Error('No email provided for OTP verification'));
    }

    return new Observable<void>((observer: Observer<void>) => {
      setTimeout(() => {
        // Simplify for now - just check against valid OTP
        if (otp === VALID_OTP) {
          observer.next();
          observer.complete();
        } else {
          observer.error(new Error(API_ERRORS.invalidOtp));
        }
      }, 800);
    });
  }

  forgotPassword(email: string): Observable<void> {
    return new Observable<void>((observer: Observer<void>) => {
      setTimeout(() => {
        // Check if user exists
        if (!MOCK_USERS[email]) {
          // For security reasons, don't reveal if email exists or not
          // Just pretend we sent an email
          observer.next();
          observer.complete();
          return;
        }

        // Store email for later verification
        this.currentUserEmail = email;

        // Generate and store OTP
        MockStorage.storeOtp(email);
        MockStorage.recordPasswordResetRequest(email);

        observer.next();
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserEmail = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Helper method to get current user role - useful for testing different flows
  getCurrentUserRole(): string | null {
    if (!this.currentUserEmail) return null;
    const user = MOCK_USERS[this.currentUserEmail];
    return user ? user.role : null;
  }
}
