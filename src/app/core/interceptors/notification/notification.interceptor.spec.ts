import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@shared/components/notification/notification.service';
import { Observable, of, throwError } from 'rxjs';

import { NotificationInterceptor } from './notification.interceptor';

// Create a mock HttpHandler class for testing
class MockHttpHandler implements HttpHandler {
  constructor(private response: Observable<HttpEvent<unknown>>) {}

  handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    return this.response;
  }
}

describe('NotificationInterceptor', () => {
  let interceptor: NotificationInterceptor;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  
  beforeEach(() => {
    // Create NotificationService mock
    notificationServiceMock = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    } as unknown as jest.Mocked<NotificationService>;
    
    TestBed.configureTestingModule({
      providers: [
        NotificationInterceptor,
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    });
    
    interceptor = TestBed.inject(NotificationInterceptor);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
  
  describe('shouldSkipNotification', () => {
    it('should skip notifications for GET requests', () => {
      const request = new HttpRequest<unknown>('GET', '/api/users', null);
      const handler = new MockHttpHandler(of(new HttpResponse<unknown>()));
      
      interceptor.intercept(request, handler).subscribe();
      
      expect(notificationServiceMock.success).not.toHaveBeenCalled();
      expect(notificationServiceMock.error).not.toHaveBeenCalled();
    });
    
    it('should skip notifications for specific endpoints', () => {
      const request = new HttpRequest<unknown>('POST', '/admin/create-nsp', null);
      const handler = new MockHttpHandler(of(new HttpResponse<unknown>()));
      
      interceptor.intercept(request, handler).subscribe();
      
      expect(notificationServiceMock.success).not.toHaveBeenCalled();
      expect(notificationServiceMock.error).not.toHaveBeenCalled();
    });
    
    it('should not skip notifications for other POST requests', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users', null);
      const successResponse = new HttpResponse({
        body: { message: 'User created' },
        status: 201
      });
      const handler = new MockHttpHandler(of(successResponse));
      
      interceptor.intercept(request, handler).subscribe();
      
      expect(notificationServiceMock.success).toHaveBeenCalledWith('User created');
    });
  });
    describe('success notifications', () => {
    it('should show success notification when response has message', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users', null);
      const successResponse = new HttpResponse({
        body: { message: 'User created successfully' },
        status: 201
      });
      const handler = new MockHttpHandler(of(successResponse));
      
      interceptor.intercept(request, handler).subscribe();
      
      expect(notificationServiceMock.success).toHaveBeenCalledWith('User created successfully');
    });
    
    it('should use default success message for POST when no message in response', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users', null);
      const successResponse = new HttpResponse({
        body: { id: 123 },
        status: 201
      });
      const handler = new MockHttpHandler(of(successResponse));
      
      interceptor.intercept(request, handler).subscribe();
      
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Successfully created');
    });
    
    it('should use default success message for PUT when no message in response', () => {
      const request = new HttpRequest<unknown>('PUT', '/api/users/1', null);
      const successResponse = new HttpResponse({
        body: { id: 1 },
        status: 200
      });
      const handler = new MockHttpHandler(of(successResponse));
      
      interceptor.intercept(request, handler).subscribe();
      
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Successfully updated');
    });
    
    it('should use default success message for PATCH when no message in response', () => {
      const request = new HttpRequest<unknown>('PATCH', '/api/users/1', null);
      const successResponse = new HttpResponse({
        body: { id: 1 },
        status: 200
      });
      const handler = new MockHttpHandler(of(successResponse));
      
      interceptor.intercept(request, handler).subscribe();
      
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Successfully updated');
    });
    
    it('should use default success message for DELETE when no message in response', () => {
      const request = new HttpRequest<unknown>('DELETE', '/api/users/1', null);
      const successResponse = new HttpResponse({
        status: 204
      });
      const handler = new MockHttpHandler(of(successResponse));
      
      interceptor.intercept(request, handler).subscribe();
      
      expect(notificationServiceMock.success).toHaveBeenCalledWith('Successfully deleted');
    });
  });
    describe('error notifications', () => {
    it('should show error notification with message from error response', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users', null);
      const errorMessage = 'Email already exists';
      const errorResponse = new HttpErrorResponse({
        error: { message: errorMessage },
        status: 400
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith(errorMessage);
    });
    
    it('should show error notification with message from nested error object', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users', null);
      const errorMessage = 'Validation failed';
      const errorResponse = new HttpErrorResponse({
        error: { error: { message: errorMessage } },
        status: 400
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith(errorMessage);
    });
    
    it('should show default error message for 400 Bad Request', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users', null);
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 400
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Bad request. Please check your input.');
    });
    
    it('should show default error message for 401 Unauthorized', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users');
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 401
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Unauthorized. Please log in again.');
    });
    
    it('should show default error message for 403 Forbidden', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users');
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 403
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Forbidden. You don\'t have permission to access this resource.');
    });
    
    it('should show default error message for 404 Not Found', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users');
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 404
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Resource not found.');
    });
    
    it('should show default error message for 422 Unprocessable Entity', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users');
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 422
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Validation error. Please check your input.');
    });
    
    it('should show default error message for 500 Server Error', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users');
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 500
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Server error. Please try again later.');
    });
    
    it('should show network error message for status 0', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users');
      const errorResponse = new HttpErrorResponse({
        error: new Error('Network Error'),
        status: 0
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });
    
    it('should show generic error message for unknown status codes', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users');
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: 503,
        statusText: 'Service Unavailable'
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Error 503: Service Unavailable');
    });
  });
  
  describe('edge cases', () => {
    it('should handle client-side errors', () => {
      const request = new HttpRequest<unknown>('POST', '/api/users');
      const errorEvent = new ErrorEvent('Error', { message: 'Client error occurred' });
      const errorResponse = new HttpErrorResponse({
        error: errorEvent,
        status: 0
      });
      const handler = new MockHttpHandler(throwError(() => errorResponse));
      
      interceptor.intercept(request, handler).subscribe({
        error: () => {}
      });
      
      expect(notificationServiceMock.error).toHaveBeenCalledWith('Network error. Please check your connection.');
    });
    
    it('should return original error for further handling', (done) => {
      const request = new HttpRequest<unknown>('POST', '/api/users');
      const originalError = new HttpErrorResponse({
        error: { message: 'Original error' },
        status: 400
      });
      const handler = new MockHttpHandler(throwError(() => originalError));
      
      interceptor.intercept(request, handler).subscribe({
        next: () => done.fail('Should have errored'),
        error: (error) => {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe('Original error');
          done();
        }
      });
    });
  });
});