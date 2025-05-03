import { BreadcrumbService } from '@Admin/services/breadcrumb.service';
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
  breadcrumbs: { label: string; link?: string }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, ClickOutsideDirective],
  templateUrl: './sidebar.component.html'
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
      label: 'Dashboard',
      icon: 'M4 6h16M4 12h16M4 18h16',
      route: '/admin/dashboard',
      breadcrumbs: [{ label: 'Dashboard' }],
    },
    {
      label: 'NSP',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      route: '/admin/nsps',
      breadcrumbs: [{ label: 'NSP' }],
    },
    {
      label: 'Facilitators',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      route: '/admin/facilitators',
      breadcrumbs: [{ label: 'Facilitators' }],
    },
    {
      label: 'Settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      route: '/admin/settings',
      breadcrumbs: [{ label: 'Settings' }],
    },
  ];

  ngOnInit(): void {
    // Set initial active route
    this.activeRoute = this.router.url;

    // Update breadcrumbs and active route on navigation
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.activeRoute = this.router.url;
      const currentNavItem = this.navItems.find(item =>
        this.router.url.startsWith(item.route));

      if (currentNavItem) {
        this.updateBreadcrumbs(currentNavItem.breadcrumbs);
      }
    });

    // Set initial breadcrumbs
    const initialNavItem = this.navItems.find(item =>
      this.router.url.startsWith(item.route));
    if (initialNavItem) {
      this.updateBreadcrumbs(initialNavItem.breadcrumbs);
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  updateBreadcrumbs(breadcrumbs: { label: string; link?: string }[]): void {
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
