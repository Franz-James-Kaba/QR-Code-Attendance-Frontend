import { provideHttpClient, withInterceptors, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { authInterceptor } from '@core/interceptors/auth/auth.interceptor';
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

const notificationInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const interceptor = new NotificationInterceptor();
  
  const handler = {
    handle: (request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => next(request)
  };
  
  return interceptor.intercept(req, handler);
};

function initializeAuth(store: Store) {
  return () => {
    store.dispatch(AuthActions.initAuth());
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
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        notificationInterceptorFn
      ])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [Store],
      multi: true
    },
    NavigationLoadingInterceptor
  ],
};
