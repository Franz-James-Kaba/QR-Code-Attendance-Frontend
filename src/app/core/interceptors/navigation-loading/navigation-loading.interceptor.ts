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

  public setupNavigationListener(): void {
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
        if (event instanceof NavigationStart) {
          this.navigationInProgress = true;

          if (this.navigationTimeout) {
            clearTimeout(this.navigationTimeout);
          }

          this.navigationTimeout = setTimeout(() => {
            if (this.navigationInProgress) {
              this.loadingService.showNavigationLoading();
            }
          }, 100);
        }

        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.navigationInProgress = false;

          if (this.navigationTimeout) {
            clearTimeout(this.navigationTimeout);
            this.navigationTimeout = null;
          }

          setTimeout(() => {
            this.loadingService.hideNavigationLoading();
          }, 200);
        }
      });
  }
}
