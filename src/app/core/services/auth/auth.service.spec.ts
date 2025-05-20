import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ExtendedAuthResponse, LoginCredentials } from '@shared/models/auth/auth.model';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import { AuthService } from './auth.service';

interface AuthServiceWithPrivate {
  loadStoredUser: () => void;
  fetchUserProfile: () => void;
  currentUserSubject: BehaviorSubject<ExtendedAuthResponse | null>;
  handleError: (error: HttpErrorResponse) => Observable<never>;
}

interface PartialHttpClient {
  get: jest.Mock;
  post: jest.Mock;
}

interface PartialRouter {
  navigate: jest.Mock;
}

interface LocalStorageMock {
  getItem: jest.Mock<string | null, [string]>;
  setItem: jest.Mock<void, [string, string]>;
  removeItem: jest.Mock<void, [string]>;
  clear: jest.Mock<void, []>;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpClient: jest.Mocked<HttpClient>;
  let router: jest.Mocked<Router>;
  let localStorageMock: LocalStorageMock;
  let currentUserSubject: BehaviorSubject<ExtendedAuthResponse | null>;

  const mockUser: ExtendedAuthResponse = {
    token: 'mock-token',
    email: 'test@example.com',
    role: 'NSP',
    passwordResetRequired: false,
    firstName: 'Jane',
    lastName: 'Smith',
    checkedIn: true,
  };

  const mockProfileResponse = {
    firstName: 'Jane',
    middleName: null,
    lastName: 'Smith',
    role: 'NSP',
    checkedIn: true,
  };

  const mockCredentials: LoginCredentials = {
    email: 'test@example.com',
    password: 'password123',
  };
  beforeEach(() => {
    const httpClientMock: PartialHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
    };
    httpClient = httpClientMock as unknown as jest.Mocked<HttpClient>;

    const routerMock: PartialRouter = {
      navigate: jest.fn(),
    };
    router = routerMock as unknown as jest.Mocked<Router>;

    let store: { [key: string]: string } = {};
    localStorageMock = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpClient },
        { provide: Router, useValue: router },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('constructor', () => {
    it('should call loadStoredUser', () => {
      const loadStoredUserSpy = jest.spyOn(
        AuthService.prototype as any,
        'loadStoredUser'
      );
      TestBed.inject(AuthService);
      expect(loadStoredUserSpy).toHaveBeenCalled();
      loadStoredUserSpy.mockRestore();
    });
  });

  describe('loadStoredUser', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
      currentUserSubject = (service as unknown as AuthServiceWithPrivate).currentUserSubject;
    });

    it('should load user and fetch profile if token and user data exist', fakeAsync(() => {
      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));
      const fetchUserProfileSpy = jest.spyOn(
        service as unknown as AuthServiceWithPrivate,
        'fetchUserProfile'
      );
      httpClient.get.mockReturnValue(of(mockProfileResponse));

      (service as unknown as AuthServiceWithPrivate).loadStoredUser();
      tick();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(environment.auth.tokenKey);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('current_user');
      expect(currentUserSubject.getValue()).toEqual(mockUser);
      expect(fetchUserProfileSpy).toHaveBeenCalled();
    }));

    it('should call logout if JSON parsing fails', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce('invalid-json');
      const logoutSpy = jest.spyOn(service, 'logout');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (service as unknown as AuthServiceWithPrivate).loadStoredUser();

      expect(logoutSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error parsing stored user data',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it('should do nothing if no token or user data', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const fetchUserProfileSpy = jest.spyOn(
        service as unknown as AuthServiceWithPrivate,
        'fetchUserProfile'
      );

      (service as unknown as AuthServiceWithPrivate).loadStoredUser();

      expect(fetchUserProfileSpy).not.toHaveBeenCalled();
      expect(currentUserSubject.getValue()).toBeNull();
    });
  });

  describe('fetchUserProfile', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
      currentUserSubject = (service as unknown as AuthServiceWithPrivate).currentUserSubject;
    });

    it('should update user with profile data and valid role', fakeAsync(() => {
      httpClient.get.mockReturnValue(of(mockProfileResponse));
      currentUserSubject.next(mockUser);
      localStorageMock.getItem.mockReturnValue('mock-token');

      let emittedUser: ExtendedAuthResponse | null = null;
      const subscription = service.currentUser$.subscribe(user => {
        emittedUser = user;
      });

      (service as unknown as AuthServiceWithPrivate).fetchUserProfile();
      tick();
      flushMicrotasks();

      expect(emittedUser).toEqual({
        ...mockUser,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'NSP',
        checkedIn: true,
        email: 'test@example.com',
      });
      expect(httpClient.get).toHaveBeenCalledWith(
        `${environment.api.baseUrl}/metrics/user-info`,
        { headers: { Authorization: 'Bearer mock-token' } }
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'current_user',
        JSON.stringify(emittedUser)
      );

      subscription.unsubscribe();
    }));

    it('should use fallback role if invalid', fakeAsync(() => {
      const invalidProfile = { ...mockProfileResponse, role: 'INVALID' };
      httpClient.get.mockReturnValue(of(invalidProfile));
      currentUserSubject.next(mockUser);
      localStorageMock.getItem.mockReturnValue('mock-token');

      let emittedUser: ExtendedAuthResponse | null = null;
      const subscription = service.currentUser$.subscribe(user => {
        emittedUser = user;
      });

      (service as unknown as AuthServiceWithPrivate).fetchUserProfile();
      tick();
      flushMicrotasks();

      expect(emittedUser).not.toBeNull();
      expect(emittedUser!.role).toBe('NSP');

      subscription.unsubscribe();
    }));

    it('should handle fetch profile error', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 500 });
      httpClient.get.mockReturnValue(throwError(() => error));
      currentUserSubject.next(mockUser);
      localStorageMock.getItem.mockReturnValue('mock-token');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();      try {
        (service as unknown as AuthServiceWithPrivate).fetchUserProfile();
        tick();
        flushMicrotasks();
      } catch (err) {
        console.log('Caught expected error during test:', err);
      }

      expect(httpClient.get).toHaveBeenCalledWith(
        `${environment.api.baseUrl}/metrics/user-info`,
        { headers: { Authorization: 'Bearer mock-token' } }
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user profile:', error);
      expect(currentUserSubject.getValue()).toEqual(mockUser);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    }));
  });

  describe('login', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
      currentUserSubject = (service as unknown as AuthServiceWithPrivate).currentUserSubject;
    });

    it('should login and store user data', fakeAsync(() => {
      httpClient.post.mockReturnValue(of(mockUser));
      httpClient.get.mockReturnValue(of(mockProfileResponse));

      let emittedUser: ExtendedAuthResponse | null = null;
      const subscription = service.login(mockCredentials).subscribe(user => {
        emittedUser = user;
      });

      tick();
      flushMicrotasks();

      expect(emittedUser).toEqual({ ...mockUser, email: mockCredentials.email });
      expect(httpClient.post).toHaveBeenCalledWith(
        `${environment.auth.baseUrl}/login`,
        mockCredentials
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        environment.auth.tokenKey,
        mockUser.token
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'current_user',
        JSON.stringify({ ...mockUser, email: mockCredentials.email })
      );
      expect(currentUserSubject.getValue()).toEqual({ ...mockUser, email: mockCredentials.email });
      expect(httpClient.get).toHaveBeenCalledWith(
        `${environment.api.baseUrl}/metrics/user-info`,
        { headers: { Authorization: 'Bearer mock-token' } }
      );

      subscription.unsubscribe();
    }));

    it('should handle login error', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 401 });
      httpClient.post.mockReturnValue(throwError(() => error));

      let caughtError: Error | null = null;
      const subscription = service.login(mockCredentials).subscribe({
        error: (err: Error) => {
          caughtError = err;
        },
      });

      tick();
      flushMicrotasks();

      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe(
        'Invalid credentials. Please check your email and password.'
      );
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(currentUserSubject.getValue()).toBeNull();

      subscription.unsubscribe();
    }));
  });

  describe('logout', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
      currentUserSubject = (service as unknown as AuthServiceWithPrivate).currentUserSubject;
    });

    it('should clear storage and set user to null', () => {
      currentUserSubject.next(mockUser);
      localStorageMock.getItem.mockReturnValue('mock-token');

      service.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(environment.auth.tokenKey);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('current_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(currentUserSubject.getValue()).toBeNull();
    });
  });

  describe('resetPassword', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('should reset password successfully', fakeAsync(() => {
      httpClient.post.mockReturnValue(of('Password reset successful'));
      const email = 'test@example.com';
      const token = 'reset-token';
      const passwords = { password: 'newpass', confirmPassword: 'newpass' };

      let result: string | null = null;
      const subscription = service.resetPassword(email, token, passwords).subscribe(res => {
        result = res;
      });

      tick();
      flushMicrotasks();

      expect(result).toBe('Password reset successful');
      expect(httpClient.post).toHaveBeenCalledWith(
        `${environment.auth.baseUrl}/reset-password?email=${email}&token=${token}`,
        passwords
      );

      subscription.unsubscribe();
    }));

    it('should handle reset password error', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 403 });
      httpClient.post.mockReturnValue(throwError(() => error));

      let caughtError: Error | null = null;
      const subscription = service
        .resetPassword('test@example.com', 'token', {
          password: 'newpass',
          confirmPassword: 'newpass',
        })
        .subscribe({
          error: (err: Error) => {
            caughtError = err;
          },
        });

      tick();
      flushMicrotasks();

      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe('You do not have permission to perform this action.');

      subscription.unsubscribe();
    }));
  });

  describe('firstTimePasswordReset', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('should reset first-time password', fakeAsync(() => {
      httpClient.post.mockReturnValue(of('Password reset successful'));
      const email = 'test@example.com';
      const passwords = { password: 'newpass', confirmPassword: 'newpass' };

      let result: string | null = null;
      const subscription = service.firstTimePasswordReset(email, passwords).subscribe(res => {
        result = res;
      });

      tick();
      flushMicrotasks();

      expect(result).toBe('Password reset successful');
      expect(httpClient.post).toHaveBeenCalledWith(
        `${environment.auth.baseUrl}/first-password-reset?email=${email}`,
        passwords
      );

      subscription.unsubscribe();
    }));

    it('should handle first-time reset error', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 404 });
      httpClient.post.mockReturnValue(throwError(() => error));

      let caughtError: Error | null = null;
      const subscription = service
        .firstTimePasswordReset('test@example.com', {
          password: 'newpass',
          confirmPassword: 'newpass',
        })
        .subscribe({
          error: (err: Error) => {
            caughtError = err;
          },
        });

      tick();
      flushMicrotasks();

      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe('The requested resource was not found.');

      subscription.unsubscribe();
    }));
  });

  describe('requestPasswordReset', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('should request password reset', fakeAsync(() => {
      httpClient.post.mockReturnValue(of('Reset link sent'));

      let result: string | null = null;
      const subscription = service.requestPasswordReset('test@example.com').subscribe(res => {
        result = res;
      });

      tick();
      flushMicrotasks();

      expect(result).toBe('Reset link sent');
      expect(httpClient.post).toHaveBeenCalledWith(
        `${environment.auth.baseUrl}/reset-password-request?email=test@example.com`,
        {}
      );

      subscription.unsubscribe();
    }));

    it('should handle request error', fakeAsync(() => {
      const error = new HttpErrorResponse({ error: { message: 'Invalid email' } });
      httpClient.post.mockReturnValue(throwError(() => error));

      let caughtError: Error | null = null;
      const subscription = service.requestPasswordReset('test@example.com').subscribe({
        error: (err: Error) => {
          caughtError = err;
        },
      });

      tick();
      flushMicrotasks();

      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe('Invalid email');

      subscription.unsubscribe();
    }));
  });

  describe('getToken', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('should return token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');
      expect(service.getToken()).toBe('mock-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith(environment.auth.tokenKey);
    });

    it('should return null if no token', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('should return true if token exists', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false if no token', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('hasPasswordResetRequired', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
      currentUserSubject = (service as unknown as AuthServiceWithPrivate).currentUserSubject;
    });

    it('should return true if password reset is required', () => {
      currentUserSubject.next({ ...mockUser, passwordResetRequired: true });
      expect(service.hasPasswordResetRequired()).toBe(true);
    });

    it('should return false if no user or not required', () => {
      currentUserSubject.next(null);
      expect(service.hasPasswordResetRequired()).toBe(false);
      currentUserSubject.next({ ...mockUser, passwordResetRequired: false });
      expect(service.hasPasswordResetRequired()).toBe(false);
    });
  });

  describe('getCurrentUserRole', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
      currentUserSubject = (service as unknown as AuthServiceWithPrivate).currentUserSubject;
    });

    it('should return user role', () => {
      currentUserSubject.next(mockUser);
      expect(service.getCurrentUserRole()).toBe('NSP');
    });

    it('should return null if no user', () => {
      currentUserSubject.next(null);
      expect(service.getCurrentUserRole()).toBeNull();
    });
  });

  describe('getCurrentUserEmail', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
      currentUserSubject = (service as unknown as AuthServiceWithPrivate).currentUserSubject;
    });

    it('should return user email', () => {
      currentUserSubject.next(mockUser);
      expect(service.getCurrentUserEmail()).toBe('test@example.com');
    });

    it('should return null if no user', () => {
      currentUserSubject.next(null);
      expect(service.getCurrentUserEmail()).toBeNull();
    });
  });

  describe('Observables', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
      currentUserSubject = (service as unknown as AuthServiceWithPrivate).currentUserSubject;
    });

    it('currentUser$ should emit current user', fakeAsync(() => {
      currentUserSubject.next(mockUser);
      let emittedUser: ExtendedAuthResponse | null = null;
      const subscription = service.currentUser$.subscribe(user => {
        emittedUser = user;
      });
      tick();
      expect(emittedUser).toEqual(mockUser);
      subscription.unsubscribe();
    }));

    it('checkedIn$ should emit checkedIn status', fakeAsync(() => {
      currentUserSubject.next(mockUser);
      let checkedIn: boolean | null = null;
      const subscription = service.checkedIn$.subscribe(status => {
        checkedIn = status;
      });
      tick();
      expect(checkedIn).toBe(true);
      subscription.unsubscribe();
    }));

    it('checkedIn$ should emit false if no user', fakeAsync(() => {
      currentUserSubject.next(null);
      let checkedIn: boolean | null = null;
      const subscription = service.checkedIn$.subscribe(status => {
        checkedIn = status;
      });
      tick();
      expect(checkedIn).toBe(false);
      subscription.unsubscribe();
    }));
  });

  describe('handleError', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('should handle 401 error', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 401 });
      let caughtError: Error | null = null;
      const subscription = (service as unknown as AuthServiceWithPrivate)
        .handleError(error)
        .subscribe({
          error: (err: Error) => {
            caughtError = err;
          },
        });
      tick();
      flushMicrotasks();
      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe(
        'Invalid credentials. Please check your email and password.'
      );
      subscription.unsubscribe();
    }));

    it('should handle 403 error', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 403 });
      let caughtError: Error | null = null;
      const subscription = (service as unknown as AuthServiceWithPrivate)
        .handleError(error)
        .subscribe({
          error: (err: Error) => {
            caughtError = err;
          },
        });
      tick();
      flushMicrotasks();
      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe('You do not have permission to perform this action.');
      subscription.unsubscribe();
    }));

    it('should handle error with string message', fakeAsync(() => {
      const error = new HttpErrorResponse({ error: 'Custom error' });
      let caughtError: Error | null = null;
      const subscription = (service as unknown as AuthServiceWithPrivate)
        .handleError(error)
        .subscribe({
          error: (err: Error) => {
            caughtError = err;
          },
        });
      tick();
      flushMicrotasks();
      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe('Custom error');
      subscription.unsubscribe();
    }));

    it('should handle error with object message', fakeAsync(() => {
      const error = new HttpErrorResponse({ error: { message: 'Object error' } });
      let caughtError: Error | null = null;
      const subscription = (service as unknown as AuthServiceWithPrivate)
        .handleError(error)
        .subscribe({
          error: (err: Error) => {
            caughtError = err;
          },
        });
      tick();
      flushMicrotasks();
      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe('Object error');
      subscription.unsubscribe();
    }));

    it('should handle unknown error', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 500 });
      let caughtError: Error | null = null;
      const subscription = (service as unknown as AuthServiceWithPrivate)
        .handleError(error)
        .subscribe({
          error: (err: Error) => {
            caughtError = err;
          },
        });
      tick();
      flushMicrotasks();
      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe('An unknown error occurred');
      subscription.unsubscribe();
    }));
  });
});
