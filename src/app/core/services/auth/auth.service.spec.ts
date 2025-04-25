import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  MOCK_USERS,
  MockStorage,
  API_ERRORS,
  VALID_OTP
} from '@core/data/mock-data';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);

    localStorage.clear();

    jest.spyOn(MockStorage, 'storeOtp').mockClear();
    jest.spyOn(MockStorage, 'recordPasswordResetRequest').mockClear();
    jest.spyOn(MockStorage, 'completePasswordReset').mockClear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', fakeAsync(async () => {
      // Arrange
      const credentials = {
        email: 'admin@amalitech.com',
        password: 'Admin@123'
      };

      // Act - using modern Promise approach
      const loginPromise = firstValueFrom(service.login(credentials));
      tick(2000);
      const result = await loginPromise;

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
      expect(result.user.role).toBe(MOCK_USERS[credentials.email].role);
      expect(result.token).toBeDefined();
    }));

   it('should return error with invalid email', fakeAsync(async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@amalitech.com',
        password: 'RandomPassword'
      };

      // Act & Assert
      const loginPromise = firstValueFrom(service.login(credentials));
      tick(2000);

      await expect(loginPromise).rejects.toEqual(
        expect.objectContaining({ message: API_ERRORS.invalidCredentials })
      );
    }));

    it('should return error with invalid password', fakeAsync(async () => {
      // Arrange
      const credentials = {
        email: 'admin@amalitech.com',
        password: 'WrongPassword'
      };

      // Act & Assert
      const loginPromise = firstValueFrom(service.login(credentials));
      tick(2000);

      await expect(loginPromise).rejects.toThrow(API_ERRORS.invalidCredentials);
    }));

    it('should set internal user email on successful login', fakeAsync(async () => {
      // Arrange
      const credentials = {
        email: 'admin@amalitech.com',
        password: 'Admin@123'
      };

      // Act
      const loginPromise = firstValueFrom(service.login(credentials));
      tick(2000);
      await loginPromise;

      // Assert
      expect(service.getCurrentUserRole()).toBe(MOCK_USERS[credentials.email].role);
    }));
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid data', fakeAsync(async () => {
      // Arrange - first login to set current user
      const loginCredentials = {
        email: 'admin@amalitech.com',
        password: 'Admin@123'
      };
      const newPassword = 'NewPassword@123';

      // Set up user session
      await firstValueFrom(service.login(loginCredentials));
      tick(2000);

      // Mock the MockStorage static method
      jest.spyOn(MockStorage, 'completePasswordReset');

      // Act
      const resetPromise = firstValueFrom(service.resetPassword(loginCredentials.password, newPassword));
      tick(2000);
      await resetPromise;

      // Assert
      expect(MockStorage.completePasswordReset).toHaveBeenCalledWith(loginCredentials.email);
      expect(MOCK_USERS[loginCredentials.email].password).toBe(newPassword);
      expect(MOCK_USERS[loginCredentials.email].passwordResetRequired).toBe(false);
    }));

    it('should return error when old password is incorrect', fakeAsync(async () => {
      // Arrange - first login to set current user
      const loginCredentials = {
        email: 'admin@amalitech.com',
        password: 'Admin@123'
      };
      const wrongOldPassword = 'WrongOldPassword';
      const newPassword = 'NewPassword@123';

      // Set up user session
      await firstValueFrom(service.login(loginCredentials));
      tick(2000);

      // Act & Assert
      const resetPromise = firstValueFrom(service.resetPassword(wrongOldPassword, newPassword));
      tick(2000);

      await expect(resetPromise).rejects.toThrow(API_ERRORS.oldPasswordIncorrect);
      expect(MOCK_USERS[loginCredentials.email].password).toBe(loginCredentials.password); // Password unchanged
    }));

    it('should return error when there is no active user session', fakeAsync(async () => {
      // Arrange
      const newPassword = 'NewPassword@123';

      // Act & Assert
      const resetPromise = firstValueFrom(service.resetPassword('', newPassword));
      tick(2000);

      await expect(resetPromise).rejects.toThrow('No active user session');
    }));
  });

  describe('verifyOtp', () => {
    it('should successfully verify valid OTP', fakeAsync(async () => {
      // Arrange - first set up user email with forgotPassword
      const email = 'admin@amalitech.com';

      // Set up user session
      await firstValueFrom(service.forgotPassword(email));
      tick(2000);

      // Act
      const verifyPromise = firstValueFrom(service.verifyOtp(VALID_OTP));
      tick(1000);
      await verifyPromise;

      // Assert - if no error is thrown, the test passes
      expect(true).toBeTruthy();
    }));

    it('should return error with invalid OTP', fakeAsync(async () => {
      // Arrange - first set up user email
      const email = 'admin@amalitech.com';
      const invalidOtp = '999999'; // Not the VALID_OTP

      // Set up user session
      await firstValueFrom(service.forgotPassword(email));
      tick(2000);

      // Act & Assert
      const verifyPromise = firstValueFrom(service.verifyOtp(invalidOtp));
      tick(1000);

      await expect(verifyPromise).rejects.toThrow(API_ERRORS.invalidOtp);
    }));

    it('should return error when no email is provided for OTP verification', fakeAsync(async () => {
      // Arrange - no user email set

      // Act & Assert
      const verifyPromise = firstValueFrom(service.verifyOtp(VALID_OTP));
      tick(1000);

      await expect(verifyPromise).rejects.toThrow('No email provided for OTP verification');
    }));
  });

  describe('forgotPassword', () => {
    it('should successfully process forgot password for existing user', fakeAsync(async () => {
      // Arrange
      const email = 'admin@amalitech.com';

      // Mock the MockStorage static methods
      jest.spyOn(MockStorage, 'storeOtp');
      jest.spyOn(MockStorage, 'recordPasswordResetRequest');

      // Act
      const forgotPromise = firstValueFrom(service.forgotPassword(email));
      tick(2000);
      await forgotPromise;

      // Assert
      expect(MockStorage.storeOtp).toHaveBeenCalledWith(email);
      expect(MockStorage.recordPasswordResetRequest).toHaveBeenCalledWith(email);
    }));

    it('should not reveal if email does not exist', fakeAsync(async () => {
      // Arrange
      const nonExistentEmail = 'nonexistent@amalitech.com';

      // Mock the MockStorage static methods
      jest.spyOn(MockStorage, 'storeOtp');
      jest.spyOn(MockStorage, 'recordPasswordResetRequest');

      // Act
      const forgotPromise = firstValueFrom(service.forgotPassword(nonExistentEmail));
      tick(2000);
      await forgotPromise;

      // Assert - request should succeed even for non-existent emails
      // but the storage methods should NOT be called
      expect(MockStorage.storeOtp).not.toHaveBeenCalled();
      expect(MockStorage.recordPasswordResetRequest).not.toHaveBeenCalled();
    }));
  });

  describe('logout', () => {
    it('should clear user session and token on logout', fakeAsync(async () => {
      // Arrange - set up user session and token
      const credentials = {
        email: 'admin@amalitech.com',
        password: 'Admin@123'
      };
      localStorage.setItem('auth_token', 'mock-token');

      await firstValueFrom(service.login(credentials));
      tick(2000);

      // Verify user role is set before logout
      expect(service.getCurrentUserRole()).toBe(MOCK_USERS[credentials.email].role);
      expect(localStorage.getItem('auth_token')).toBe('mock-token');

      // Act
      service.logout();

      // Assert
      expect(service.getCurrentUserRole()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    }));
  });

  describe('getToken', () => {
    it('should retrieve token from localStorage', () => {
      // Arrange
      const mockToken = 'mock-auth-token';
      localStorage.setItem('auth_token', mockToken);

      // Act
      const result = service.getToken();

      // Assert
      expect(result).toBe(mockToken);
    });

    it('should return null when no token exists', () => {
      // Arrange - ensure localStorage is empty
      localStorage.removeItem('auth_token');

      // Act
      const result = service.getToken();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getCurrentUserRole', () => {
    it('should return null when no user is logged in', () => {
      // Act
      const result = service.getCurrentUserRole();

      // Assert
      expect(result).toBeNull();
    });

    it('should return correct role for logged in user', fakeAsync(async () => {
      // Arrange
      const credentials = {
        email: 'admin@amalitech.com',
        password: 'Admin@123'
      };
      const expectedRole = MOCK_USERS[credentials.email].role;

      // Act
      await firstValueFrom(service.login(credentials));
      tick(2000);
      const result = service.getCurrentUserRole();

      // Assert
      expect(result).toBe(expectedRole);
    }));
  });
});
