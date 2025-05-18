import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@core/services/auth/auth.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AuthActions } from '@store/actions/auth.actions';

import { authInterceptor } from './auth.interceptor';

interface LocalStorageMock {
  getItem: jest.Mock<string | null, [string]>;
  setItem: jest.Mock<void, [string, string]>;
  removeItem: jest.Mock<void, [string]>;
  clear: jest.Mock<void, []>;
}

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: jest.Mocked<AuthService>;
  let store: MockStore;
  let localStorageMock: LocalStorageMock;

  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    const authServiceMock = {
      getToken: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    let localStorageStore: { [key: string]: string } = {};
    localStorageMock = {
      getItem: jest.fn((key: string) => localStorageStore[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        localStorageStore[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete localStorageStore[key];
      }),
      clear: jest.fn(() => {
        localStorageStore = {};
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideMockStore(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    store = TestBed.inject(MockStore);

    jest.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('should add an Authorization header with token', () => {
    localStorageMock.getItem.mockReturnValue(mockToken);

    httpClient.get('/api/data').subscribe();

    const httpRequest = httpTestingController.expectOne('/api/data');
    expect(httpRequest.request.headers.has('Authorization')).toBe(true);
    expect(httpRequest.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

    httpRequest.flush({ data: 'test' });
  });

  test('should not add Authorization header when no token is available', () => {
    localStorageMock.getItem.mockReturnValue(null);

    httpClient.get('/api/data').subscribe();

    const httpRequest = httpTestingController.expectOne('/api/data');
    expect(httpRequest.request.headers.has('Authorization')).toBe(false);

    httpRequest.flush({ data: 'test' });
  });

  test('should dispatch logout action on 401 Unauthorized error', () => {
    localStorageMock.getItem.mockReturnValue(mockToken);

    const testRequest = httpClient.get('/api/protected').subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(store.dispatch).toHaveBeenCalledWith(AuthActions.logout());
      },
    });

    const httpRequest = httpTestingController.expectOne('/api/protected');
    httpRequest.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  test('should pass through errors other than 401', () => {
    localStorageMock.getItem.mockReturnValue(mockToken);

    const testRequest = httpClient.get('/api/protected').subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(store.dispatch).not.toHaveBeenCalled();
      },
    });

    const httpRequest = httpTestingController.expectOne('/api/protected');
    httpRequest.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });

  test('should handle successful responses correctly', () => {
    localStorageMock.getItem.mockReturnValue(mockToken);
    const mockData = { success: true, data: 'test data' };

    httpClient.get('/api/data').subscribe(response => {
      expect(response).toEqual(mockData);
    });

    const httpRequest = httpTestingController.expectOne('/api/data');
    httpRequest.flush(mockData);
  });

  test('should handle multiple requests with the same token', () => {
    localStorageMock.getItem.mockReturnValue(mockToken);

    httpClient.get('/api/first').subscribe();
    httpClient.get('/api/second').subscribe();

    const firstRequest = httpTestingController.expectOne('/api/first');
    const secondRequest = httpTestingController.expectOne('/api/second');

    expect(firstRequest.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(secondRequest.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

    firstRequest.flush({ id: 1 });
    secondRequest.flush({ id: 2 });
  });
});
