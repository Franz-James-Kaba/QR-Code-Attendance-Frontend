import {
  provideHttpClient,
  withInterceptors,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { ErrorInterceptor } from '@core/interceptors/error/error.interceptor';
import { NavigationLoadingInterceptor } from '@core/interceptors/navigation-loading/navigation-loading.interceptor';
import { NotificationInterceptor } from '@core/interceptors/notification/notification.interceptor';
import { provideEffects } from '@ngrx/effects';
import { provideStore, Store } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AuthActions } from '@store/states/auth/auth.actions';
import { AuthEffects } from '@store/states/auth/auth.effects';
import { authReducer } from '@store/states/auth/auth.reducer';
import { Observable } from 'rxjs';

import { routes } from './app.routes';

const authInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};

const notificationInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const interceptor = new NotificationInterceptor();

  const handler = {
    handle: (request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => next(request),
  };

  return interceptor.intercept(req, handler);
};

// Factory function that returns a function that initializes auth
function initializeAuthFactory(store: Store) {
  return () => {
    store.dispatch(AuthActions.initAuth());
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideAnimations(),
    provideStore({ auth: authReducer }),
    provideEffects(AuthEffects),
    provideStoreDevtools(),
    provideHttpClient(withInterceptors([authInterceptorFn, notificationInterceptorFn])),
    // Use APP_INITIALIZER with the correct factory pattern
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthFactory,
      deps: [Store],
      multi: true,
    },
    NavigationLoadingInterceptor,
    ErrorInterceptor,
  ],
};
