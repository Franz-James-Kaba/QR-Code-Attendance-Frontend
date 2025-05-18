import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Store } from '@ngrx/store';
import { AuthActions } from '@store/actions/auth.actions';
import { Observable, catchError, throwError } from 'rxjs';

export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const store = inject(Store);
  const token = localStorage.getItem(environment.auth.tokenKey);

  let authReq = request;
  if (token) {
    authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        store.dispatch(AuthActions.logout());
      }
      return throwError(() => error);
    })
  );
}
