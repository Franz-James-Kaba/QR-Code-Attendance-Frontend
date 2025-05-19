import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  // Add a readonly signal for Angular signals-based components
  private readonly breadcrumbsSignal = signal<BreadcrumbItem[]>([]);

  // Public accessor for the signal
  breadcrumbs = this.breadcrumbsSignal.asReadonly();

  private readonly router = inject(Router);

  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const root = this.router.routerState.snapshot.root;
      const breadcrumbs = this.createBreadcrumbs(root);
      this.breadcrumbsSubject.next(breadcrumbs);
      this.breadcrumbsSignal.set(breadcrumbs); // Update signal when breadcrumbs change
    });
  }

  private createBreadcrumbs(
    route: ActivatedRouteSnapshot,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    // Initialize with Dashboard breadcrumb for admin routes
    this.initializeAdminBreadcrumbs(breadcrumbs);

    // Process current route
    if (route.routeConfig && route.routeConfig.path !== '') {
      // Build the current URL path
      url = this.buildCurrentUrl(route, url);

      // Add breadcrumb for current route if applicable
      this.addCurrentRouteBreadcrumb(route, url, breadcrumbs);
    }

    // Process child routes
    if (route.children.length > 0) {
      return this.processChildRoutes(route, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  // Helper to initialize admin dashboard breadcrumb
  private initializeAdminBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    if (breadcrumbs.length === 0 && this.router.url.startsWith('/admin')) {
      breadcrumbs.push({
        label: 'Dashboard',
        link: '/admin/dashboard',
      });
    }
  }

  // Helper to build the current URL
  private buildCurrentUrl(route: ActivatedRouteSnapshot, baseUrl: string): string {
    const routeUrl = route.url.map(segment => segment.path).join('/');
    return routeUrl ? `${baseUrl}/${routeUrl}` : baseUrl;
  }

  // Helper to add breadcrumb for the current route
  private addCurrentRouteBreadcrumb(
    route: ActivatedRouteSnapshot,
    url: string,
    breadcrumbs: BreadcrumbItem[]
  ): void {
    const routeUrl = route.url.map(segment => segment.path).join('/');

    if (route.data['breadcrumb']) {
      breadcrumbs.push({
        label: route.data['breadcrumb'],
        link: url,
      });
    } else if (route.data['title']) {
      breadcrumbs.push({
        label: route.data['title'],
        link: url,
      });
    } else if (routeUrl) {
      breadcrumbs.push({
        label: this.formatRouteLabel(routeUrl),
        link: url,
      });
    }
  }

  // Helper to process child routes
  private processChildRoutes(
    route: ActivatedRouteSnapshot,
    url: string,
    breadcrumbs: BreadcrumbItem[]
  ): BreadcrumbItem[] {
    for (const child of route.children) {
      if (child.routeConfig && this.isRouteActive(child)) {
        return this.createBreadcrumbs(child, url, breadcrumbs);
      }
    }
    return breadcrumbs;
  }

  // Helper method to check if a route is active (part of current navigation)
  private isRouteActive(route: ActivatedRouteSnapshot): boolean {
    // Explicitly handle potential null or undefined values
    const hasUrl = !!route.url && Array.isArray(route.url) && route.url.length > 0;
    const isParentRoute =
      route.children.length > 0 && !!route.routeConfig && route.routeConfig.path === '';

    return hasUrl || isParentRoute;
  }

  // Helper method to format route URL into readable label
  private formatRouteLabel(routeUrl: string): string {
    return routeUrl
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  // Method for manual updates when needed (for example from sidebar navigation)
  updateBreadcrumbs(items: BreadcrumbItem[] | null) {
    const newItems = items ?? [];
    this.breadcrumbsSubject.next(newItems);
    this.breadcrumbsSignal.set(newItems); // Update signal as well
  }
}
