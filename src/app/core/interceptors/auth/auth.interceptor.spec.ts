import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@core/services/auth/auth.service';
import { AuthActions } from '@core/store/states/auth/auth.actions';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: jest.Mocked<AuthService>;
  let store: MockStore;

  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    // Create mock auth service
    const authServiceMock = {
      getToken: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideMockStore(),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    store = TestBed.inject(MockStore);

    // Spy on store.dispatch
    jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests
    httpTestingController.verify();
  });

  test('should add an Authorization header with token', () => {
    // Arrange
    authService.getToken.mockReturnValue(mockToken);

    // Act
    httpClient.get('/api/data').subscribe();

    // Assert
    const httpRequest = httpTestingController.expectOne('/api/data');
    expect(httpRequest.request.headers.has('Authorization')).toBe(true);
    expect(httpRequest.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

    // Complete the request
    httpRequest.flush({ data: 'test' });
  });

  test('should not add Authorization header when no token is available', () => {
    // Arrange
    authService.getToken.mockReturnValue(null);

    // Act
    httpClient.get('/api/data').subscribe();

    // Assert
    const httpRequest = httpTestingController.expectOne('/api/data');
    expect(httpRequest.request.headers.has('Authorization')).toBe(false);

    // Complete the request
    httpRequest.flush({ data: 'test' });
  });

  test('should dispatch logout action on 401 Unauthorized error', () => {
    // Arrange
    authService.getToken.mockReturnValue(mockToken);

    // Act
    const testRequest = httpClient.get('/api/protected').subscribe({
      error: (error: HttpErrorResponse) => {
        // Assert
        expect(error.status).toBe(401);
        expect(store.dispatch).toHaveBeenCalledWith(AuthActions.logout());
      }
    });

    // Simulate a 401 response
    const httpRequest = httpTestingController.expectOne('/api/protected');
    httpRequest.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  test('should pass through errors other than 401', () => {
    // Arrange
    authService.getToken.mockReturnValue(mockToken);

    // Act & Assert
    const testRequest = httpClient.get('/api/protected').subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(store.dispatch).not.toHaveBeenCalled();
      }
    });

    // Simulate a 500 response
    const httpRequest = httpTestingController.expectOne('/api/protected');
    httpRequest.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });

  test('should handle successful responses correctly', () => {
    // Arrange
    authService.getToken.mockReturnValue(mockToken);
    const mockData = { success: true, data: 'test data' };

    // Act & Assert
    httpClient.get('/api/data').subscribe(response => {
      expect(response).toEqual(mockData);
    });

    // Complete with mock data
    const httpRequest = httpTestingController.expectOne('/api/data');
    httpRequest.flush(mockData);
  });

  test('should handle multiple requests with the same token', () => {
    // Arrange
    authService.getToken.mockReturnValue(mockToken);

    // Act - make multiple requests
    httpClient.get('/api/first').subscribe();
    httpClient.get('/api/second').subscribe();

    // Assert
    const firstRequest = httpTestingController.expectOne('/api/first');
    const secondRequest = httpTestingController.expectOne('/api/second');

    expect(firstRequest.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(secondRequest.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

    // Complete requests
    firstRequest.flush({ id: 1 });
    secondRequest.flush({ id: 2 });
  });
});
