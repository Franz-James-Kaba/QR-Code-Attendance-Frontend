import { DestroyRef } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';
import { LoadingService } from '@core/services/loading/loading.service';
import { Subject } from 'rxjs';

import { NavigationLoadingInterceptor } from './navigation-loading.interceptor';

describe('NavigationLoadingInterceptor', () => {
  let interceptor: NavigationLoadingInterceptor;
  let routerEventSubject: Subject<Event>;
  let loadingServiceMock: jest.Mocked<LoadingService>;
  let routerMock: Partial<Router>;
  let destroyRefMock: Partial<DestroyRef>;

  beforeEach(() => {
    // Create router events subject and mocks
    routerEventSubject = new Subject<Event>();
    
    loadingServiceMock = {
      showNavigationLoading: jest.fn(),
      hideNavigationLoading: jest.fn()
    } as unknown as jest.Mocked<LoadingService>;
    
    routerMock = {
      events: routerEventSubject.asObservable()
    };
    
    // Mock notifyOnDestroy to handle takeUntilDestroyed
    destroyRefMock = {
      onDestroy: jest.fn()
    };

    // Configure testing module
    TestBed.configureTestingModule({
      providers: [
        NavigationLoadingInterceptor,
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: DestroyRef, useValue: destroyRefMock }
      ]
    });

    interceptor = TestBed.inject(NavigationLoadingInterceptor);
    
    // Spy on timeout functions
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should show navigation loading after delay when navigation starts', fakeAsync(() => {
    // Simulate navigation start
    routerEventSubject.next(new NavigationStart(1, 'test-url'));
    
    // No loading should be shown immediately
    expect(loadingServiceMock.showNavigationLoading).not.toHaveBeenCalled();
    
    // Move timer forward less than the threshold (100ms)
    tick(50);
    expect(loadingServiceMock.showNavigationLoading).not.toHaveBeenCalled();
    
    // Move timer to the threshold
    tick(50);
    expect(loadingServiceMock.showNavigationLoading).toHaveBeenCalledTimes(1);
  }));

  it('should not show loading if navigation completes before timeout', fakeAsync(() => {
    // Start navigation
    routerEventSubject.next(new NavigationStart(1, 'test-url'));
    
    // Navigation completes before timeout
    tick(50);
    routerEventSubject.next(new NavigationEnd(1, 'test-url', 'test-url'));
    
    // Complete the timeout
    tick(50);
    expect(loadingServiceMock.showNavigationLoading).not.toHaveBeenCalled();
    
    // Verify hiding was called after delay
    tick(200);
    expect(loadingServiceMock.hideNavigationLoading).toHaveBeenCalledTimes(1);
  }));

  it('should hide navigation loading when navigation ends', fakeAsync(() => {
    // Start and complete navigation
    routerEventSubject.next(new NavigationStart(1, 'test-url'));
    tick(150); // Past the 100ms loading delay
    expect(loadingServiceMock.showNavigationLoading).toHaveBeenCalledTimes(1);
    
    // Navigation ends
    routerEventSubject.next(new NavigationEnd(1, 'test-url', 'test-url'));
    
    // Verify hideNavigationLoading is called after delay
    tick(200);
    expect(loadingServiceMock.hideNavigationLoading).toHaveBeenCalledTimes(1);
  }));

  it('should hide navigation loading when navigation is cancelled', fakeAsync(() => {
    // Start navigation
    routerEventSubject.next(new NavigationStart(1, 'test-url'));
    tick(150);
    
    // Navigation is cancelled
    routerEventSubject.next(new NavigationCancel(1, 'test-url', 'Route deactivation returned false'));
    
    // Verify the loading is hidden after delay
    tick(200);
    expect(loadingServiceMock.hideNavigationLoading).toHaveBeenCalledTimes(1);
  }));

  it('should hide navigation loading when navigation errors', fakeAsync(() => {
    // Start navigation
    routerEventSubject.next(new NavigationStart(1, 'test-url'));
    tick(150);
    
    // Navigation error occurs
    routerEventSubject.next(new NavigationError(1, 'test-url', 'Error loading module'));
    
    // Verify the loading is hidden after delay
    tick(200);
    expect(loadingServiceMock.hideNavigationLoading).toHaveBeenCalledTimes(1);
  }));

  it('should handle multiple navigation events correctly', fakeAsync(() => {
    // First navigation
    routerEventSubject.next(new NavigationStart(1, 'page1'));
    tick(150);
    expect(loadingServiceMock.showNavigationLoading).toHaveBeenCalledTimes(1);
    
    // First navigation completes
    routerEventSubject.next(new NavigationEnd(1, 'page1', 'page1'));
    tick(50); // Not enough time for hiding to be called
    
    // Second navigation starts immediately
    routerEventSubject.next(new NavigationStart(2, 'page2'));
    
    // Complete hiding from first navigation
    tick(150);
    expect(loadingServiceMock.hideNavigationLoading).toHaveBeenCalledTimes(1);
    
    // Now the time passes for second navigation
    tick(100);
    expect(loadingServiceMock.showNavigationLoading).toHaveBeenCalledTimes(2);
    
    // Second navigation completes
    routerEventSubject.next(new NavigationEnd(2, 'page2', 'page2'));
    tick(200);
    expect(loadingServiceMock.hideNavigationLoading).toHaveBeenCalledTimes(2);
  }));

  it('should clear timeout if navigation completes quickly', fakeAsync(() => {
    // Create spies for setTimeout and clearTimeout
    const originalSetTimeout = window.setTimeout;
    const originalClearTimeout = window.clearTimeout;
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    
    // Start navigation
    routerEventSubject.next(new NavigationStart(1, 'test-url'));
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    
    // Navigation completes quickly
    routerEventSubject.next(new NavigationEnd(1, 'test-url', 'test-url'));
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    // Advance time to ensure loading was not shown
    tick(150);
    expect(loadingServiceMock.showNavigationLoading).not.toHaveBeenCalled();
    
    // Restore original functions
    window.setTimeout = originalSetTimeout;
    window.clearTimeout = originalClearTimeout;
  }));

  it('should not show loading indicator for very fast navigations', fakeAsync(() => {
    // Start navigation
    routerEventSubject.next(new NavigationStart(1, 'test-url'));
    
    // Complete navigation immediately (before timeout)
    routerEventSubject.next(new NavigationEnd(1, 'test-url', 'test-url'));
    
    // Advance time past the loading delay
    tick(150);
    expect(loadingServiceMock.showNavigationLoading).not.toHaveBeenCalled();
    
    // Advance time past the hiding delay
    tick(200);
    expect(loadingServiceMock.hideNavigationLoading).toHaveBeenCalledTimes(1);
  }));
});