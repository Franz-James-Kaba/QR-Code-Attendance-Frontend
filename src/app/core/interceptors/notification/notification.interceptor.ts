import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NotificationService } from '@shared/components/notification/notification.service';
import { Observable, catchError, tap, throwError } from 'rxjs';

interface ResponseWithMessage {
  message?: string;
  [key: string]: unknown;
}

@Injectable()
export class NotificationInterceptor implements HttpInterceptor {
  private readonly notificationService = inject(NotificationService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip notification for specific endpoints or request types if needed
    if (this.shouldSkipNotification(request)) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      tap(event => {
        // Show success notification for successful responses with specific status codes
        if (event instanceof HttpResponse) {
          if (this.shouldShowSuccessNotification(event, request)) {
            const message = this.getSuccessMessage(event, request);
            if (message) {
              this.notificationService.success(message);
            }
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Show error notification for error responses
        if (this.shouldShowErrorNotification()) {
          const message = this.getErrorMessage(error);
          this.notificationService.error(message);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Determine if notification should be skipped for this request
   */
  private shouldSkipNotification(request: HttpRequest<unknown>): boolean {
    const skipEndpoints = [
      '/api/auth/refresh-token',
      '/admin/create-nsp',
      '/admin/users/',
      '/admin/bulk-create-nsps',
      '/admin/create-facilitator',
      '/admin/users/facilitators',
      '/admin/bulk-create-facilitators',
      '/admin/create-facilitator',
      '/admin/edit-facilitator',
      '/admin/delete-facilitator',
    ];

    return (
      request.method === 'GET' ||
      skipEndpoints.some(endpoint => request.url.includes(endpoint))
    );
  }

  /**
   * Determine if success notification should be shown
   */
  private shouldShowSuccessNotification(
    response: HttpResponse<unknown>,
    request: HttpRequest<unknown>
  ): boolean {
    // Show success notifications for POST, PUT, PATCH, DELETE requests
    // You can customize this logic based on your API's response format
    return (
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
      response.status >= 200 &&
      response.status < 300
    );
  }

  private getSuccessMessage(
    response: HttpResponse<ResponseWithMessage>,
    request: HttpRequest<unknown>
  ): string {
    // Try to get message from response body if it exists
    if (response.body?.message) {
      return response.body.message;
    }

    // Check if it's a login request
    if (request.url.includes('/login')) {
      return 'Login successful';
    }

    // Default success messages based on method
    switch (request.method) {
      case 'POST':
        return 'Successfully created';
      case 'PUT':
      case 'PATCH':
        return 'Successfully updated';
      case 'DELETE':
        return 'Successfully deleted';
      default:
        return 'Operation completed successfully';
    }
  }

  /**
   * Determine if error notification should be shown
   */
  private shouldShowErrorNotification(): boolean {
    // Always show error notifications except for specific cases
    // You can customize this logic based on your needs
    return true;
  }

  /**
   * Get appropriate error message based on error response
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    // Try to get message from error response if it exists
    if (error.error?.message) {
      return error.error.message;
    }

    // Or from a nested error object
    if (error.error?.error?.message) {
      return error.error.error.message;
    }

    // Default error messages based on status code
    switch (error.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return "Forbidden. You don't have permission to access this resource.";
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 0:
        return 'Network error. Please check your connection.';
      default:
        return `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
    }
  }
}
