import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ExtendedAuthResponse, UserRole, LoginCredentials } from '@shared/models/auth/auth.model';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<ExtendedAuthResponse | null>(null);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);

  public currentUser$ = this.currentUserSubject.asObservable();
  public checkedIn$ = this.currentUser$.pipe(map(user => user?.checkedIn ?? false));

  private readonly cookieOptions = {
    expires: 1,
    path: '/',
    secure: true,
    sameSite: 'Strict' as const,
  };

  constructor() {
    this.loadStoredUser();
  }
  private loadStoredUser(): void {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/auth/')) {
      this.currentUserSubject.next(null);
      return;
    }

    const token = this.getToken();
    const userStr = localStorage.getItem('current_user');

    if (token && userStr) {
      try {
        const userData: ExtendedAuthResponse = JSON.parse(userStr);
        this.currentUserSubject.next(userData);

        const shouldFetchProfile = !currentPath.includes('/auth/') && !this.hasRecentProfileData();

        if (shouldFetchProfile) {
          this.fetchUserProfile();
        }
      } catch (e) {
        console.error('Error parsing stored user data', e);
        this.logout();
      }
    } else {
      this.currentUserSubject.next(null);

      if (!currentPath.includes('/auth/')) {
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: currentPath },
          });
        }, 100);
      }
    }
  }

  private hasRecentProfileData(): boolean {
    const lastFetchStr = localStorage.getItem('last_profile_fetch');
    if (lastFetchStr) {
      const lastFetch = parseInt(lastFetchStr, 10);
      const now = Date.now();
      return now - lastFetch < 5 * 60 * 1000;
    }
    return false;
  }

  private fetchUserProfile(): void {
    const currentPath = window.location.pathname;

    if (
      currentPath.includes('/auth/') ||
      currentPath.includes('/unauthorized') ||
      currentPath.includes('/not-found')
    ) {
      return;
    }

    const token = this.getToken();
    if (!token) {
      return;
    }

    if (!environment?.api?.baseUrl) {
      console.error('Environment.api.baseUrl is undefined:', environment);
      return;
    }

    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      return;
    }

    const lastFetchStr = localStorage.getItem('last_profile_fetch');
    if (lastFetchStr) {
      const lastFetch = parseInt(lastFetchStr, 10);
      const now = Date.now();
      if (now - lastFetch < 5 * 60 * 1000) {
        return;
      }
    }

    const headers = { Authorization: `Bearer ${token}` };
    this.http
      .get<{
        firstName: string;
        middleName: string | null;
        lastName: string;
        role: string;
        checkedIn: boolean;
      }>(`${environment.api.baseUrl}/metrics/user-info`, { headers })
      .pipe(
        tap(profile => {
          if (currentUser) {
            const validRole: UserRole = this.isValidUserRole(profile.role)
              ? profile.role
              : currentUser.role || 'NSP';
            const updatedUser: ExtendedAuthResponse = {
              ...currentUser,
              firstName: profile.firstName,
              lastName: profile.lastName,
              role: validRole,
              checkedIn: profile.checkedIn,
              email: currentUser.email ?? null,
            };
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
            localStorage.setItem('last_profile_fetch', Date.now().toString());
            this.currentUserSubject.next(updatedUser);
          }
        }),
        catchError(error => {
          console.error('Error fetching user profile:', error);
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => new Error('Failed to load user profile'));
        })
      )
      .subscribe();
  }

  private isValidUserRole(role: string): role is UserRole {
    return ['ADMIN', 'FACILITATOR', 'NSP', 'RECEPTIONIST'].includes(role);
  }

  public login(credentials: LoginCredentials): Observable<ExtendedAuthResponse> {
    if (!environment?.auth?.baseUrl) {
      console.error('Environment.auth.baseUrl is undefined:', environment);
      return throwError(() => new Error('Environment configuration missing'));
    }
    return this.http
      .post<ExtendedAuthResponse>(`${environment.auth.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          const responseWithEmail: ExtendedAuthResponse = {
            ...response,
            email: credentials.email ?? null,
          };
          if (!environment?.auth?.tokenKey) {
            console.error('Environment.auth.tokenKey is undefined:', environment);
            localStorage.setItem('auth_token', responseWithEmail.token);
          } else {
            localStorage.setItem(environment.auth.tokenKey, responseWithEmail.token);
          }

          this.setToken(responseWithEmail.token);

          localStorage.setItem('current_user', JSON.stringify(responseWithEmail));
          this.currentUserSubject.next(responseWithEmail);
          this.fetchUserProfile();
        }),
        catchError(this.handleError)
      );
  }

  public resetPassword(
    email: string,
    token: string,
    passwords: { password: string; confirmPassword: string }
  ): Observable<string> {
    if (!environment?.auth?.baseUrl) {
      console.error('Environment.auth.baseUrl is undefined:', environment);
      return throwError(() => new Error('Environment configuration missing'));
    }
    return this.http
      .post<string>(
        `${environment.auth.baseUrl}/reset-password?email=${email}&token=${token}`,
        passwords
      )
      .pipe(catchError(this.handleError));
  }

  public firstTimePasswordReset(
    email: string,
    passwords: { password: string; confirmPassword: string }
  ): Observable<string> {
    if (!environment?.auth?.baseUrl) {
      console.error('Environment.auth.baseUrl is undefined:', environment);
      return throwError(() => new Error('Environment configuration missing'));
    }
    return this.http
      .post<string>(`${environment.auth.baseUrl}/first-password-reset?email=${email}`, passwords)
      .pipe(catchError(this.handleError));
  }

  public requestPasswordReset(email: string): Observable<string> {
    if (!environment?.auth?.baseUrl) {
      console.error('Environment.auth.baseUrl is undefined:', environment);
      return throwError(() => new Error('Environment configuration missing'));
    }
    return this.http
      .post<string>(`${environment.auth.baseUrl}/reset-password-request?email=${email}`, {})
      .pipe(catchError(this.handleError));
  }

  public logout(): void {
    this.cookieService.delete('auth_token', '/');

    if (environment?.auth?.tokenKey) {
      localStorage.removeItem(environment.auth.tokenKey);
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('last_profile_fetch');

    this.currentUserSubject.next(null);
  }

  private setToken(token: string): void {
    this.cookieService.set('auth_token', token, this.cookieOptions);

    if (environment?.auth?.tokenKey) {
      localStorage.setItem(environment.auth.tokenKey, token);
    }
    localStorage.setItem('auth_token', token);
  }

  public getToken(): string | null {
    if (this.cookieService.check('auth_token')) {
      return this.cookieService.get('auth_token');
    }

    if (environment?.auth?.tokenKey) {
      const token = localStorage.getItem(environment.auth.tokenKey);
      if (token) return token;
    }

    return localStorage.getItem('auth_token');
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
