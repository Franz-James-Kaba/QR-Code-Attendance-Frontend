import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: Breadcrumb[] = [];
  routerSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      });

    // Initialize breadcrumbs
    this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    // Get the current URL segment from the route's first path
    const firstPathSegment = this.router.url.split('/')[1];

    // Add the first-level section (Admin, NSP, etc.) if not already added
    if (breadcrumbs.length === 0 && firstPathSegment) {
      const firstSegmentLabel = this.formatRouteLabel(firstPathSegment);
      const firstSegmentUrl = `/${firstPathSegment}`;

      breadcrumbs.push({
        label: firstSegmentLabel,
        url: firstSegmentUrl,
      });
    }

    // Get the route's children
    const children: ActivatedRoute[] = route.children;

    // Return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    // Iterate over each child
    for (const child of children) {
      // Get the route's URL segment
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      // Append route to the URL
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      // Add breadcrumb if the route has data with a title
      if (child.snapshot.data['title']) {
        // Check if this breadcrumb would duplicate the last entry
        const isDuplicate =
          breadcrumbs.length > 0 &&
          breadcrumbs[breadcrumbs.length - 1].label === child.snapshot.data['title'];

        if (!isDuplicate) {
          const breadcrumb: Breadcrumb = {
            label: child.snapshot.data['title'],
            url: url,
          };
          breadcrumbs.push(breadcrumb);
        }
      } else if (routeURL !== '') {
        // If no title is provided but we have a route URL, use the capitalized route URL as the label
        const label = this.formatRouteLabel(routeURL);

        // Check if this would duplicate the last entry
        const isDuplicate =
          breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].label === label;

        if (!isDuplicate) {
          const breadcrumb: Breadcrumb = {
            label,
            url: url,
          };
          breadcrumbs.push(breadcrumb);
        }
      }

      // Recursive call to process any child routes
      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private formatRouteLabel(route: string): string {
    // Split the route on hyphens or underscores and capitalize each part
    return route
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
