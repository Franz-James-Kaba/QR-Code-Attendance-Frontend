import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthActions } from '@store/actions/auth.actions';
import { CookieService } from 'ngx-cookie-service';
import { Observable, catchError, throwError } from 'rxjs';

export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const store = inject(Store);
  const cookieService = inject(CookieService);
  
  // Skip adding auth token for auth-related endpoints (login, reset password, etc.)
  const isAuthEndpoint = request.url.includes('/api/auth/');
  if (isAuthEndpoint) {
    return next(request);
  }
  
  // Get token directly instead of through the AuthService to avoid circular dependency
  let token = cookieService.check('auth_token') ? cookieService.get('auth_token') : null;
  
  // Fallback to localStorage if not in cookie
  token ??= localStorage.getItem('auth_token');
  
  // Skip adding token if we're not authenticated
  if (!token) {
    return next(request);
  }
  
  // Add token to the request
  const authReq = request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`),
  });
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Dispatch logout action to clear auth state
        store.dispatch(AuthActions.logout());
        
        // Clear token directly instead of using AuthService
        cookieService.delete('auth_token', '/');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('last_profile_fetch');
      }
      return throwError(() => error);
    })
  );
}
