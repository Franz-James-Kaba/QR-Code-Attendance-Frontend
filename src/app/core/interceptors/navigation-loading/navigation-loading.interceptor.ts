import { inject, Injectable } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import { LoadingService } from '@core/services/loading/loading.service';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoadingInterceptor {
  private navigationInProgress = false;
  private navigationTimeout: any = null;
  private readonly router = inject(Router)
  private readonly loadingService = inject(LoadingService)

  constructor(
  ) {
    this.setupNavigationListener();
  }

  setupNavigationListener(): void {
    this.router.events.pipe(
      // Only interested in navigation events
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      // Show loading when navigation starts
      if (event instanceof NavigationStart) {
        this.navigationInProgress = true;

        // Clear any existing timeout
        if (this.navigationTimeout) {
          clearTimeout(this.navigationTimeout);
        }

        // Add a small delay to avoid flickering for fast navigations
        this.navigationTimeout = setTimeout(() => {
          if (this.navigationInProgress) {
            this.loadingService.showNavigationLoading();
          }
        }, 200); // 200ms delay before showing the loader
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

        // Add a small delay before hiding to ensure transitions are smooth
        setTimeout(() => {
          this.loadingService.hideNavigationLoading();
        }, 100);
      }
    });
  }
}
