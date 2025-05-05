import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '@core/store/states/auth/auth.actions';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token from localStorage
    const token = localStorage.getItem(environment.auth.tokenKey);

    // Clone the request and add the authorization header if token exists
    if (token) {
      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
      
      // Pass the cloned request with the auth header to the next handler
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Token is expired or invalid, dispatch logout action
            this.store.dispatch(AuthActions.logout());
          }
          return throwError(() => error);
        })
      );
    }

    // If no token, proceed with the original request
    return next.handle(request);
  }
}
