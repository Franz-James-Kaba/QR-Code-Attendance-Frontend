import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { AuthResponse, LoginCredentials, UserRole } from '@shared/models/auth/auth.model';
import { catchError, firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let localStorageSpy: jest.SpyInstance;
  
  const mockToken = 'mock-token';
  const mockEmail = 'test@example.com';
  const mockUser: AuthResponse = {
    token: mockToken,
    role: 'ADMIN' as UserRole,
    email: mockEmail,
    passwordResetRequired: false
  };
  
  const mockCredentials: LoginCredentials = {
    email: mockEmail,
    password: 'password123'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    
    // Mock localStorage
    localStorageSpy = jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');
    
    // Clear localStorage mocks before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadStoredUser', () => {
    it('should load user from localStorage on initialization', () => {
      // Setup localStorage mock to return data
      const storedUser = JSON.stringify(mockUser);
      localStorageSpy.mockImplementation((key) => {
        if (key === environment.auth.tokenKey) return mockToken;
        if (key === 'current_user') return storedUser;
        return null;
      });
      
      // Re-initialize service to trigger constructor
      service = TestBed.inject(AuthService);
      
      // Check if the user was loaded
      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should handle invalid JSON in localStorage', () => {
      // Setup localStorage mock to return invalid JSON
      localStorageSpy.mockImplementation((key) => {
        if (key === environment.auth.tokenKey) return mockToken;
        if (key === 'current_user') return '{invalid json}';
        return null;
      });
      
      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation();
      // Spy on logout method
      jest.spyOn(AuthService.prototype, 'logout');
      
      // Re-initialize service to trigger constructor
      service = TestBed.inject(AuthService);
      
      expect(console.error).toHaveBeenCalled();
      expect(AuthService.prototype.logout).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should authenticate user and store token', () => {
      service.login(mockCredentials).subscribe(response => {
        expect(response).toEqual(mockUser);
        expect(localStorage.setItem).toHaveBeenCalledWith(environment.auth.tokenKey, mockToken);
        expect(localStorage.setItem).toHaveBeenCalledWith('current_user', JSON.stringify(mockUser));
      });

      const req = httpMock.expectOne(`${environment.auth.baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ token: mockToken, role: 'ADMIN' as UserRole, passwordResetRequired: false });
    });

    it('should handle login error', () => {
      const errorResponse = { message: 'Invalid credentials' };
      service.login(mockCredentials).subscribe({
        next: () => {},
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });

      const req = httpMock.expectOne(`${environment.auth.baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('resetPassword', () => {
    it('should send reset password request', () => {
      const passwords = { password: 'newpass123', confirmPassword: 'newpass123' };
      const token = 'reset-token';
      
      service.resetPassword(mockEmail, token, passwords).subscribe(response => {
        expect(response).toBe('Password reset successful');
      });

      const req = httpMock.expectOne(`${environment.auth.baseUrl}/reset-password?email=${mockEmail}&token=${token}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(passwords);
      req.flush('Password reset successful');
    });
  });

  describe('firstTimePasswordReset', () => {
    it('should reset password for first time login and update user', fakeAsync(() => {
      // Set up a mock current user in the service
      localStorage.setItem(environment.auth.tokenKey, mockToken);
      localStorage.setItem('current_user', JSON.stringify({...mockUser, passwordResetRequired: true}));
      service['loadStoredUser']();

      const passwords = { password: 'newpass123', confirmPassword: 'newpass123' };
      
      service.firstTimePasswordReset(mockEmail, passwords).subscribe(response => {
        expect(response).toBe('Password reset successful');
      });

      const req = httpMock.expectOne(`${environment.auth.baseUrl}/first-password-reset?email=${mockEmail}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(passwords);
      req.flush('Password reset successful');
      tick();

      // Check that user was updated with passwordResetRequired = false
      service.currentUser$.subscribe(user => {
        expect(user?.passwordResetRequired).toBe(false);
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('current_user', expect.any(String));
    }));
  });

  describe('requestPasswordReset', () => {
    it('should send password reset request', () => {
      service.requestPasswordReset(mockEmail).subscribe(response => {
        expect(response).toBe('Password reset email sent');
      });

      const req = httpMock.expectOne(`${environment.auth.baseUrl}/reset-password-request?email=${mockEmail}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush('Password reset email sent');
    });
  });

  describe('logout', () => {
    it('should clear local storage and navigate to login', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      
      service.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith(environment.auth.tokenKey);
      expect(localStorage.removeItem).toHaveBeenCalledWith('current_user');
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);

      // Check that current user is null
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      // Setup a mock user for testing
      localStorage.setItem(environment.auth.tokenKey, mockToken);
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      service['loadStoredUser']();
    });
    
    it('should get token from localStorage', () => {
      expect(service.getToken()).toBe(mockToken);
    });

    it('should check if user is logged in', () => {
      expect(service.isLoggedIn()).toBe(true);
      
      localStorage.removeItem(environment.auth.tokenKey);
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should check if password reset is required', () => {
      expect(service.hasPasswordResetRequired()).toBe(false);
      
      // Set user with password reset required
      const userWithReset = {...mockUser, passwordResetRequired: true};
      localStorage.setItem('current_user', JSON.stringify(userWithReset));
      service['loadStoredUser']();
      
      expect(service.hasPasswordResetRequired()).toBe(true);
    });

    it('should get current user role', () => {
      expect(service.getCurrentUserRole()).toBe('ADMIN' as UserRole);
      
      service['currentUserSubject'].next(null);
      expect(service.getCurrentUserRole()).toBeNull();
    });

    it('should get current user email', () => {
      expect(service.getCurrentUserEmail()).toBe(mockEmail);
      
      service['currentUserSubject'].next(null);
      expect(service.getCurrentUserEmail()).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle client-side errors', async () => {
      const clientError = new HttpErrorResponse({
        error: new ErrorEvent('Client Error', { message: 'Client-side error' }),
        status: 0
      });

      const error = await firstValueFrom(
        service['handleError'](clientError)
          .pipe(
            catchError(err => {
              expect(err.message).toBe('Error: Client-side error');
              throw err;
            })
          )
      ).catch(e => e);

      expect(error.message).toBe('Error: Client-side error');
    });

    it('should handle 401 errors', async () => {
      const unauthorizedError = new HttpErrorResponse({
        error: 'Unauthorized',
        status: 401
      });

      const error = await firstValueFrom(
        service['handleError'](unauthorizedError)
          .pipe(
            catchError(err => {
              expect(err.message).toBe('Invalid credentials. Please check your email and password.');
              throw err;
            })
          )
      ).catch(e => e);

      expect(error.message).toBe('Invalid credentials. Please check your email and password.');
    });

    it('should handle errors with custom messages', async () => {
      const customError = new HttpErrorResponse({
        error: { message: 'Custom error message' },
        status: 400
      });

      const error = await firstValueFrom(
        service['handleError'](customError)
          .pipe(
            catchError(err => {
              expect(err.message).toBe('Custom error message');
              throw err;
            })
          )
      ).catch(e => e);

      expect(error.message).toBe('Custom error message');
    });
  });
});