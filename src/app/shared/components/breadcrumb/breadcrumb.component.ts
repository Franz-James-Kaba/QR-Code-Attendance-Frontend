import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  @Input() items: { label: string; link?: string }[] = []; // Add items input property

  public breadcrumbs: Breadcrumb[] = [];
  public routerSubscription: Subscription | undefined;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    // If items are provided, use them instead of generating breadcrumbs
    if (this.items && this.items.length > 0) {
      this.mapItemsToBreadcrumbs();
    } else {
      this.routerSubscription = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
        });

      // Initialize breadcrumbs
      this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Map external items to internal breadcrumbs format
  private mapItemsToBreadcrumbs(): void {
    this.breadcrumbs = this.items.map(item => ({
      label: item.label,
      url: item.link ?? '' // Map link to url
    }));
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    // Add the first-level section if needed
    this.addFirstLevelBreadcrumb(breadcrumbs);

    // Get the route's children
    const children: ActivatedRoute[] = route.children;

    // Return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    // Process the first child route
    const child = children[0];
    const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

    // Append route to the URL if not empty
    if (routeURL !== '') {
      url += `/${routeURL}`;
    }

    // Process breadcrumb from route data or URL
    this.processBreadcrumbFromRoute(child, routeURL, url, breadcrumbs);

    // Recursive call to process any child routes
    return this.createBreadcrumbs(child, url, breadcrumbs);
  }

  private addFirstLevelBreadcrumb(breadcrumbs: Breadcrumb[]): void {
    const firstPathSegment = this.router.url.split('/')[1];

    if (breadcrumbs.length === 0 && firstPathSegment) {
      const firstSegmentLabel = this.formatRouteLabel(firstPathSegment);
      const firstSegmentUrl = `/${firstPathSegment}`;

      breadcrumbs.push({
        label: firstSegmentLabel,
        url: firstSegmentUrl
      });
    }
  }

  private processBreadcrumbFromRoute(
    route: ActivatedRoute,
    routeURL: string,
    url: string,
    breadcrumbs: Breadcrumb[]
  ): void {
    // Process title-based breadcrumb
    if (route.snapshot.data['title']) {
      this.addBreadcrumbIfNotDuplicate(
        route.snapshot.data['title'],
        url,
        breadcrumbs
      );
    }
    // Process URL-based breadcrumb when no title is available
    else if (routeURL !== '') {
      const label = this.formatRouteLabel(routeURL);
      this.addBreadcrumbIfNotDuplicate(label, url, breadcrumbs);
    }
  }

  private addBreadcrumbIfNotDuplicate(label: string, url: string, breadcrumbs: Breadcrumb[]): void {
    const isDuplicate = breadcrumbs.length > 0 &&
                        breadcrumbs[breadcrumbs.length - 1].label === label;

    if (!isDuplicate) {
      breadcrumbs.push({
        label,
        url
      });
    }
  }

  private formatRouteLabel(route: string): string {
    // Split the route on hyphens or underscores and capitalize each part
    return route
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
