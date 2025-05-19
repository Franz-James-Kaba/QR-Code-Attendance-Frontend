import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ExtendedAuthResponse, UserRole, AuthResponse } from '@shared/models/auth/auth.model';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = environment.auth.tokenKey;
  private readonly API_URL = environment.auth.baseUrl;
  private readonly currentUserSubject = new BehaviorSubject<ExtendedAuthResponse | null>(null);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  public currentUser$ = this.currentUserSubject.asObservable();
  public checkedIn$ = this.currentUser$.pipe(map(user => user?.checkedIn ?? false));

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('current_user');

    if (token && userStr) {
      try {
        const userData: ExtendedAuthResponse = JSON.parse(userStr);
        this.currentUserSubject.next(userData);
        this.fetchUserProfile();
      } catch (e) {
        console.error('Error parsing stored user data', e);
        this.logout();
      }
    }
  }

  private fetchUserProfile(): void {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    this.http
      .get<{
        firstName: string;
        middleName: string | null;
        lastName: string;
        role: string;
        checkedIn: boolean;
      }>(`${environment.api.baseUrl}/metrics/user-info`, { headers })
      .pipe(
        tap(response => {
          // Ensure email is included in the response
          const responseWithEmail: AuthResponse = {
            ...response,
            email: this.currentUserSubject.value?.email ?? '',
            token: this.getToken() ?? '',
            passwordResetRequired: false
          };

          localStorage.setItem(this.TOKEN_KEY, responseWithEmail.token);
          localStorage.setItem('current_user', JSON.stringify(responseWithEmail));
          this.currentUserSubject.next(responseWithEmail);
        }),
        catchError(this.handleError)
      );
  }

  public resetPassword(
    email: string,
    token: string,
    passwords: { password: string; confirmPassword: string }
  ): Observable<string> {
    return this.http
      .post<string>(`${this.API_URL}/reset-password?email=${email}&token=${token}`, passwords)
      .pipe(catchError(this.handleError));
  }

  firstTimePasswordReset(email: string, passwords: { password: string, confirmPassword: string }): Observable<string> {
    return this.http.post<string>(
      `${this.API_URL}/first-password-reset?email=${email}`,
      passwords
    ).pipe(
      tap(() => {
        // After successful password reset, we should clear the passwordResetRequired flag
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            passwordResetRequired: false
          };
          localStorage.setItem('current_user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      }),
      catchError(this.handleError)
    );
  }
  public requestPasswordReset(email: string): Observable<string> {
    return this.http
      .post<string>(`${this.API_URL}/reset-password-request?email=${email}`, {})
      .pipe(catchError(this.handleError));
  }

  public logout(): void {
    // Clear all authentication-related data from localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');

    // Clear the current user from the BehaviorSubject
    this.currentUserSubject.next(null);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public hasPasswordResetRequired(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.passwordResetRequired : false;
  }

  public getCurrentUserRole(): UserRole | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  public getCurrentUserEmail(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.email : null;
  }

  public login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          // Store token in localStorage
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem('auth_token', response.token);

          // Store user data in localStorage
          const userData = {
            ...response
          };
          localStorage.setItem('current_user', JSON.stringify(userData));
          localStorage.setItem('auth_user', JSON.stringify({
            role: response.role,
            email: response.email,
            passwordResetRequired: response.passwordResetRequired
          }));

          // Update the current user subject
          this.currentUserSubject.next(userData);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
