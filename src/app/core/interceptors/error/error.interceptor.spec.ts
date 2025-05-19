import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotificationService } from '@shared/services/notification.service';
import { Observable, of, throwError } from 'rxjs';

import { ErrorInterceptor } from './error.interceptor';

// Mock HTTP handler that returns an observable of the provided response
class MockHttpHandler extends HttpHandler {
  constructor(private response: Observable<HttpEvent<any>>) {
    super();
  }

  handle(): Observable<HttpEvent<any>> {
    return this.response;
  }
}

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let routerMock: jest.Mocked<Router>;
  let mockRequest: HttpRequest<unknown>;

  beforeEach(() => {
    // Create mocks
    notificationServiceMock = {
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    } as unknown as jest.Mocked<NotificationService>;

    routerMock = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    // Configure testing module
    TestBed.configureTestingModule({
      providers: [
        ErrorInterceptor,
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    interceptor = TestBed.inject(ErrorInterceptor);
    mockRequest = new HttpRequest('GET', '/api/test');

    // Clear localStorage and mocks before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  test('should pass through successful responses', (done) => {
    // Arrange
    const mockResponse = { body: 'test response' } as HttpEvent<any>;
    const mockHandler = new MockHttpHandler(of(mockResponse));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      next: (event) => {
        // Assert
        expect(event).toBe(mockResponse);
        expect(notificationServiceMock.error).not.toHaveBeenCalled();
        done();
      }
    });
  });

  test('should handle client-side errors', (done) => {
    // Arrange
    const clientError = new HttpErrorResponse({
      error: new ErrorEvent('Client Error', { message: 'Client-side error occurred' }),
      status: 0
    });
    const mockHandler = new MockHttpHandler(throwError(() => clientError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Error: Client-side error occurred');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('Error: Client-side error occurred');
        done();
      }
    });
  });

  test('should handle 400 Bad Request errors', (done) => {
    // Arrange
    const badRequestError = new HttpErrorResponse({
      error: { message: 'Invalid input data' },
      status: HttpStatusCode.BadRequest
    });
    const mockHandler = new MockHttpHandler(throwError(() => badRequestError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Invalid input data');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('Invalid input data');
        done();
      }
    });
  });

  test('should handle 401 Unauthorized errors and navigate to login', (done) => {
    // Arrange
    const unauthorizedError = new HttpErrorResponse({
      error: 'Unauthorized',
      status: HttpStatusCode.Unauthorized
    });
    const mockHandler = new MockHttpHandler(throwError(() => unauthorizedError));

    // Set up localStorage with mock values to verify removal
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('current_user', JSON.stringify({ name: 'Test User' }));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Session expired. Please log in again.');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('Session expired. Please log in again.');
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('current_user')).toBeNull();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }
    });
  });

  test('should handle 403 Forbidden errors', (done) => {
    // Arrange
    const forbiddenError = new HttpErrorResponse({
      error: 'Forbidden',
      status: HttpStatusCode.Forbidden
    });
    const mockHandler = new MockHttpHandler(throwError(() => forbiddenError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('You do not have permission to perform this action.');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('You do not have permission to perform this action.');
        done();
      }
    });
  });

  test('should handle 404 Not Found errors', (done) => {
    // Arrange
    const notFoundError = new HttpErrorResponse({
      error: 'Not Found',
      status: HttpStatusCode.NotFound
    });
    const mockHandler = new MockHttpHandler(throwError(() => notFoundError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('The requested resource was not found.');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('The requested resource was not found.');
        done();
      }
    });
  });

  test('should handle 409 Conflict errors with custom message', (done) => {
    // Arrange
    const conflictError = new HttpErrorResponse({
      error: { message: 'Resource already exists' },
      status: HttpStatusCode.Conflict
    });
    const mockHandler = new MockHttpHandler(throwError(() => conflictError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Resource already exists');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('Resource already exists');
        done();
      }
    });
  });

  test('should handle 409 Conflict errors with default message', (done) => {
    // Arrange
    const conflictError = new HttpErrorResponse({
      error: null,
      status: HttpStatusCode.Conflict
    });
    const mockHandler = new MockHttpHandler(throwError(() => conflictError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('A conflict occurred with your request.');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('A conflict occurred with your request.');
        done();
      }
    });
  });

  test('should handle 422 Unprocessable Entity errors', (done) => {
    // Arrange
    const validationError = new HttpErrorResponse({
      error: { message: 'Validation failed for field "email"' },
      status: 422
    });
    const mockHandler = new MockHttpHandler(throwError(() => validationError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Validation failed for field "email"');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('Validation failed for field "email"');
        done();
      }
    });
  });

  test('should handle 500 Server Error', (done) => {
    // Arrange
    const serverError = new HttpErrorResponse({
      error: 'Internal Server Error',
      status: HttpStatusCode.InternalServerError
    });
    const mockHandler = new MockHttpHandler(throwError(() => serverError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Server error. Please try again later.');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('Server error. Please try again later.');
        done();
      }
    });
  });

  test('should handle unknown error status with message', (done) => {
    // Arrange
    const unknownError = new HttpErrorResponse({
      error: { message: 'Custom error message' },
      status: 520 // Cloudflare error, just as an example of a non-standard code
    });
    const mockHandler = new MockHttpHandler(throwError(() => unknownError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Custom error message');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('Custom error message');
        done();
      }
    });
  });

  test('should handle unknown error status without message', (done) => {
    // Arrange
    const unknownError = new HttpErrorResponse({
      error: {},
      status: 520
    });
    const mockHandler = new MockHttpHandler(throwError(() => unknownError));

    // Act
    interceptor.intercept(mockRequest, mockHandler).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('An unexpected error occurred');
        expect(notificationServiceMock.error).toHaveBeenCalledWith('An unexpected error occurred');
        done();
      }
    });
  });
});