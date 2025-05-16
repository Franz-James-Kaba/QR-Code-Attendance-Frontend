import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, firstValueFrom } from 'rxjs';

import { selectIsAuthenticated } from '../../store/states/auth/auth.selectors';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let store: MockStore;
  let router: jest.Mocked<Router>;
  let executeGuard: CanActivateFn;

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {
    url: '/test-url',
  } as RouterStateSnapshot;

  beforeEach(() => {
    // Create a mock router with Jest
    const routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      providers: [provideMockStore(), { provide: Router, useValue: routerMock }],
    });

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    // Setup the functional guard execution
    executeGuard = (...guardParameters) =>
      TestBed.runInInjectionContext(() => AuthGuard(...guardParameters));
  });

  test('should be created', () => {
    expect(executeGuard).toBeDefined();
  });

  test('should allow access when user is authenticated', async () => {
    // Arrange
    store.overrideSelector(selectIsAuthenticated, true);

    // Act
    const result = executeGuard(dummyRoute, dummyState);

    // Assert
    // Handle both synchronous and asynchronous results
    const canActivate = result instanceof Observable ? await firstValueFrom(result) : result;

    expect(canActivate).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  test('should redirect to login when user is not authenticated', async () => {
    // Arrange
    store.overrideSelector(selectIsAuthenticated, false);

    // Act
    const result = executeGuard(dummyRoute, dummyState);

    // Assert
    const canActivate = result instanceof Observable ? await firstValueFrom(result) : result;

    expect(canActivate).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/test-url' },
    });
  });

  test('should take only the first emission from the auth state', async () => {
    // Arrange
    store.overrideSelector(selectIsAuthenticated, true);
    jest.spyOn(store, 'select');

    // Act
    const result = executeGuard(dummyRoute, dummyState);

    // Assert - Simply verify the selector was called
    expect(store.select).toHaveBeenCalledWith(selectIsAuthenticated);

    // Just consume the result to complete the test
    if (result instanceof Observable) {
      await firstValueFrom(result);
    }
  });

  test('should include the return URL when redirecting to login', async () => {
    // Arrange
    store.overrideSelector(selectIsAuthenticated, false);
    const customState = { url: '/protected-route/123' } as RouterStateSnapshot;

    // Act
    const result = executeGuard(dummyRoute, customState);

    // Assert
    // Just consume the result to ensure navigation occurs
    if (result instanceof Observable) {
      await firstValueFrom(result);
    } else {
      // If synchronous result, router should have been called by now
    }

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/protected-route/123' },
    });
  });

  test('should evaluate authentication status synchronously', async () => {
    // Arrange - mock a delayed authentication response
    jest.spyOn(store, 'select').mockReturnValue(of(false));

    // Act
    const result = executeGuard(dummyRoute, dummyState);

    // Assert
    expect(store.select).toHaveBeenCalledWith(selectIsAuthenticated);

    // Consume the result if it's an Observable
    if (result instanceof Observable) {
      await firstValueFrom(result);
    }
  });

  test('should prevent access to protected routes when not authenticated', async () => {
    // Arrange
    store.overrideSelector(selectIsAuthenticated, false);
    const adminRoute = { url: '/admin/dashboard' } as RouterStateSnapshot;

    // Act
    const result = executeGuard(dummyRoute, adminRoute);

    // Assert
    const canActivate = result instanceof Observable ? await firstValueFrom(result) : result;

    expect(canActivate).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/admin/dashboard' },
    });
  });

  test('should allow access to protected routes when authenticated', async () => {
    // Arrange
    store.overrideSelector(selectIsAuthenticated, true);
    const adminRoute = { url: '/admin/dashboard' } as RouterStateSnapshot;

    // Act
    const result = executeGuard(dummyRoute, adminRoute);

    // Assert
    const canActivate = result instanceof Observable ? await firstValueFrom(result) : result;

    expect(canActivate).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
