import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BreadcrumbItem } from '@shared/models/breadcrumb.model';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();
  private readonly breadcrumbsSignal = signal<BreadcrumbItem[]>([]);
  breadcrumbs = this.breadcrumbsSignal.asReadonly();
  private readonly router = inject(Router);
  private manuallySet = false;

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.manuallySet) {
          const root = this.router.routerState.snapshot.root;
          const breadcrumbs = this.createBreadcrumbs(root);
          this.breadcrumbsSubject.next(breadcrumbs);
          this.breadcrumbsSignal.set(breadcrumbs);
        }
        this.manuallySet = false;
      });
  }
  private createBreadcrumbs(
    route: ActivatedRouteSnapshot,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = []
  ): BreadcrumbItem[] {
    this.addAdminBreadcrumbsIfNeeded(breadcrumbs);
    const { currentPath, currentUrl } = this.getPathInfo(route, url);
    this.addBreadcrumbForCurrentRoute(route, currentPath, currentUrl, breadcrumbs);
    return this.processBreadcrumbChildren(route, currentUrl, breadcrumbs);
  }

  private addAdminBreadcrumbsIfNeeded(breadcrumbs: BreadcrumbItem[]): void {
    if (!this.router.url.startsWith('/admin') || breadcrumbs.length > 0) {
      return;
    }

    breadcrumbs.push({
      label: 'Dashboard',
      link: '/admin/dashboard',
    });

    if (this.router.url === '/admin/dashboard' || this.router.url === '/admin') {
      breadcrumbs.push({
        label: 'Overview',
        link: '/admin/dashboard',
      });
    }
  }

  private getPathInfo(route: ActivatedRouteSnapshot, baseUrl: string): { currentPath: string, currentUrl: string } {
    const pathSegments = route.url.map(segment => segment.path);
    const currentPath = pathSegments.length > 0 ? pathSegments.join('/') : '';
    const currentUrl = currentPath ? `${baseUrl}/${currentPath}` : baseUrl;
    return { currentPath, currentUrl };
  }

  private addBreadcrumbForCurrentRoute(
    route: ActivatedRouteSnapshot,
    currentPath: string,
    currentUrl: string,
    breadcrumbs: BreadcrumbItem[]
  ): void {
    if (!route.routeConfig || route.routeConfig.path === '') {
      return;
    }

    if (route.data['breadcrumb']) {
      breadcrumbs.push({
        label: route.data['breadcrumb'],
        link: currentUrl,
      });
    } else if (route.data['title']) {
      breadcrumbs.push({
        label: route.data['title'],
        link: currentUrl,
      });
    } else if (currentPath) {
      const label = currentPath
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      breadcrumbs.push({
        label: label,
        link: currentUrl,
      });
    }
  }

  private processBreadcrumbChildren(
    route: ActivatedRouteSnapshot,
    currentUrl: string,
    breadcrumbs: BreadcrumbItem[]
  ): BreadcrumbItem[] {
    if (route.children.length > 0) {
      for (const child of route.children) {
        if (child.routeConfig && child.routeConfig.path !== '**') {
          return this.createBreadcrumbs(child, currentUrl, breadcrumbs);
        }
      }
    }
    return breadcrumbs;
  }
  updateBreadcrumbs(items: BreadcrumbItem[] | null) {
    const newItems = items ?? [];
    this.manuallySet = true;
    this.breadcrumbsSubject.next(newItems);
    this.breadcrumbsSignal.set(newItems);
  }
}
