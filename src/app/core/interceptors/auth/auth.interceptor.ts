import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { AuthActions } from '@core/store/states/auth/auth.actions';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const AuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const store = inject(Store);
  const authService = inject(AuthService);
  
  // Get the auth token from service
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  if (token) {
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
    
    // Pass the cloned request with the auth header to the next handler
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token is expired or invalid, dispatch logout action
          store.dispatch(AuthActions.logout());
        }
        return throwError(() => error);
      })
    );
  }

  // If no token, proceed with the original request
  return next(request);
};