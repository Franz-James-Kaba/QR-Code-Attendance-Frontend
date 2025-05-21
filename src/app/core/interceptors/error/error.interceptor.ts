import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotificationService } from '@shared/services/notification.service';
import { CookieService } from 'ngx-cookie-service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly cookieService = inject(CookieService);
  private readonly store = inject(Store);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side errors
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message ?? 'Bad request. Please check your input.';
              break;            case 401:
              errorMessage = 'Session expired. Please log in again.';
              // Clear tokens directly
              this.cookieService.delete('auth_token', '/');
              localStorage.removeItem('auth_token');
              localStorage.removeItem('current_user');
              localStorage.removeItem('auth_user');
              // Dispatch logout action to update state
              this.store.dispatch({ type: '[Auth] Logout' });
              // Navigate to login
              this.router.navigate(['/auth/login'], {
                queryParams: { returnUrl: request.url }
              });
              break;
            case 403:
              // Special handling for metrics API calls that return 403
              if (request.url.includes('/metrics/')) {
                console.warn('Permission denied for metrics endpoint:', request.url);
                // For metrics API calls with 403, we don't show an error notification
                // This avoids flooding users with error messages for expected permission issues
                return throwError(() => new Error('Permission denied for metrics endpoint'));
              }
              
              // For other 403 errors, show a standard error message
              errorMessage = 'You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'The requested resource was not found.';
              break;
            case 409:
              errorMessage = error.error?.message ?? 'A conflict occurred with your request.';
              break;
            case 422:
              errorMessage = error.error?.message ?? 'Validation error. Please check your input.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              if (error.error?.message) {
                errorMessage = error.error.message;
              }
          }
        }

        // Show error notification
        this.notificationService.error(errorMessage);

        // Return the error for further handling
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
