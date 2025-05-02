import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { AuthResponse, LoginCredentials, UserRole } from '@shared/models/auth/auth.model';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = environment.auth.tokenKey;
  private readonly API_URL = environment.auth.baseUrl;
  private readonly currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  private readonly http = inject(HttpClient)
  private readonly router = inject(Router);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
  ) {
    // Check if user is already logged in
    this.loadStoredUser();
  }

  // Load user from localStorage when service initializes
  private loadStoredUser(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('current_user');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        this.currentUserSubject.next(userData);
      } catch (e) {
        console.error('Error parsing stored user data', e);
        this.logout();
      }
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          // Ensure email is included in the response
          const responseWithEmail: AuthResponse = {
            ...response,
            email: credentials.email // Add email from the login credentials
          };
          
          localStorage.setItem(this.TOKEN_KEY, responseWithEmail.token);
          localStorage.setItem('current_user', JSON.stringify(responseWithEmail));
          this.currentUserSubject.next(responseWithEmail);
        }),
        catchError(this.handleError)
      );
  }

  resetPassword(email: string, token: string, passwords: { password: string, confirmPassword: string }): Observable<string> {
    return this.http.post<string>(
      `${this.API_URL}/reset-password?email=${email}&token=${token}`,
      passwords
    ).pipe(
      catchError(this.handleError)
    );
  }

  firstTimePasswordReset(email: string, passwords: { password: string, confirmPassword: string }): Observable<any> {
    return this.http.post<any>(
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

  requestPasswordReset(email: string): Observable<string> {
    return this.http.post<string>(
      `${this.API_URL}/reset-password-request?email=${email}`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasPasswordResetRequired(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.passwordResetRequired : false;
  }

  getCurrentUserRole(): UserRole | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  getCurrentUserEmail(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.email : null;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
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
