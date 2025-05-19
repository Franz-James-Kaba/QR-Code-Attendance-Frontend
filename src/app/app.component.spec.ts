import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavigationLoadingInterceptor } from '@core/interceptors/navigation-loading/navigation-loading.interceptor';
import { LoadingService } from '@core/services/loading/loading.service';
import { NavigationLoadingComponent } from '@shared/components/navigation-loading/navigation-loading.component';
import { NotificationComponent } from '@shared/components/notification/notification.component';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  const mockLoadingService = {
    showNavigationLoading: jest.fn(),
    hideNavigationLoading: jest.fn(),
  };

  const mockNavigationLoadingInterceptor = {
    setupNavigationListener: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, AppComponent, NavigationLoadingComponent, NotificationComponent],
      providers: [
        provideRouter([]),
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: NavigationLoadingInterceptor, useValue: mockNavigationLoadingInterceptor },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'qr-code-attendance-frontend' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('qr-code-attendance-frontend');
  });
});
