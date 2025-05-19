import { inject, Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { LoadingService } from '@core/services/loading/loading.service';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationLoadingInterceptor {
  private navigationInProgress = false;
  private navigationTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.setupNavigationListener();
  }

  setupNavigationListener(): void {
    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        // Show loading when navigation starts
        if (event instanceof NavigationStart) {
          this.navigationInProgress = true;

          // Clear any existing timeout
          if (this.navigationTimeout) {
            clearTimeout(this.navigationTimeout);
          }

          // Reduce delay to show loader more frequently
          this.navigationTimeout = setTimeout(() => {
            if (this.navigationInProgress) {
              this.loadingService.showNavigationLoading();
            }
          }, 100); // Reduced from 100ms to 50ms to show loader more often
        }

        // Hide loading when navigation is complete or cancelled
        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.navigationInProgress = false;

          // Clear timeout to prevent showing the loader
          if (this.navigationTimeout) {
            clearTimeout(this.navigationTimeout);
            this.navigationTimeout = null;
          }

          // Increase minimum display time to ensure loader is visible
          setTimeout(() => {
            this.loadingService.hideNavigationLoading();
          }, 200); // Increased from 200ms to 500ms for better visibility
        }
      });
  }
}
