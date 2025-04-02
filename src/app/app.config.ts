import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { authInterceptor } from '@core/interceptors/auth/auth.interceptor';
import { provideEffects } from '@ngrx/effects';
import { provideStore, Store } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AuthActions } from '@store/states/auth/auth.actions';
import { AuthEffects } from '@store/states/auth/auth.effects';
import { authReducer } from '@store/states/auth/auth.reducer';

import { routes } from './app.routes';

export function initializeAuth(store: Store) {
  return () => {
    store.dispatch(AuthActions.initAuth());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideStore({ auth: authReducer }),
    provideEffects(AuthEffects),
    provideStoreDevtools(),
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [Store],
      multi: true
    }
  ],
};
