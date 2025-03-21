import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, throwError } from 'rxjs';
import { AuthResponse, LoginCredentials } from '@shared/models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'api/auth';

  //Simulate stored email for OTP verification
  private tempEmail: string | null = null;

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Simulate API call with correct response shape
    return of({
      user: {
        id: 'dummy_id_123',
        email: credentials.email,
        role: 'ADMIN',
      },
      token: 'dummy_token_123',
      passwordResetRequired: Math.random() > 0.5,
    }).pipe(delay(1000));
  }

  resetPassword(oldPassword: string, newPassword: string): Observable<void> {
    // Simulate password reset
    if (this.tempEmail) {
      // Clear stored email after successful reset
      this.tempEmail = null;
      return of(void 0).pipe(delay(1500));
    }

    return throwError(() => new Error('Password reset failed. Please try again.'));
  }

  verifyOtp(otp: string): Observable<void> {
    // Simulate OTP validation
    if (otp === '123456') {
      return of(void 0).pipe(delay(1000));
    }

    return throwError(() => new Error('Invalid verification code'));
  }

  forgotPassword(email: string): Observable<void> {
    // Store email temporarily for validation
    this.tempEmail = email;

    // Simulate API delay and success
    return of(void 0).pipe(
      delay(1500)
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
