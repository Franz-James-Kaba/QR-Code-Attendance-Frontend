import { BreadcrumbItem, BreadcrumbService } from '@Admin/core/services/breadcrumb.service';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';
import { filter, Subscription } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  breadcrumbs: BreadcrumbItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, ClickOutsideDirective],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = true;
  @Input() isMinimized = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();

  private readonly router = inject(Router);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private routerSubscription: Subscription | null = null;

  activeRoute = '';

  navItems: NavItem[] = [
    {
      label: 'Overview',
      icon: 'overview.svg',
      route: '/admin/dashboard',
      breadcrumbs: [{ label: 'Dashboard', link: '/admin/dashboard' }],
    },
    {
      label: 'NSPs',
      icon: 'account_circle.svg',
      route: '/admin/nsps',
      breadcrumbs: [
        { label: 'Dashboard', link: '/admin/dashboard' },
        { label: 'NSP Management', link: '/admin/nsps' },
      ],
    },
    {
      label: 'Facilitator',
      icon: 'account_circle.svg',
      route: '/admin/facilitators',
      breadcrumbs: [
        { label: 'Dashboard', link: '/admin/dashboard' },
        { label: 'Facilitator Management', link: '/admin/facilitators' },
      ],
    },
    {
      label: 'Session Management',
      icon: 'session.svg',
      route: '/admin/sessions',
      breadcrumbs: [
        { label: 'Dashboard', link: '/admin/dashboard' },
        { label: 'Session Management', link: '/admin/sessions' },
      ],
    },
  ];

  ngOnInit(): void {
    // Set initial active route
    this.activeRoute = this.router.url;

    // Update active route on navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.activeRoute = this.router.url;
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Only called explicitly when a user clicks a nav item
  updateBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void {
    // Only manually update breadcrumbs when user explicitly clicks a navigation item
    this.breadcrumbService.updateBreadcrumbs(breadcrumbs);
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  onClickOutside(): void {
    // Only close the sidebar on mobile screens (will be handled by the parent component)
    if (window.innerWidth < 768 && this.isOpen) {
      this.closeSidebar.emit();
    }
  }

  isRouteActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }
}
