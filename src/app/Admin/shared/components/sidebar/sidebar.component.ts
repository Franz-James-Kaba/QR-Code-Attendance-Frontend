import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { IconComponent } from '../icon/icon.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  breadcrumbs: { label: string; link?: string; }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Input() isMinimized = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly router = inject(Router);
  private readonly breadcrumbService = inject(BreadcrumbService);

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'M4 6h16M4 12h16M4 18h16',
      route: '/admin/dashboard',
      breadcrumbs: [
        { label: 'Dashboard', link: '/admin/dashboard' },
        { label: 'Overview' }
      ]
    },
    {
      label: 'Users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      route: '/admin/users',
      breadcrumbs: [
        { label: 'Dashboard', link: '/admin/dashboard' },
        { label: 'Users' }
      ]
    },
    {
      label: 'Settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      route: '/admin/settings',
      breadcrumbs: [
        { label: 'Dashboard', link: '/admin/dashboard' },
        { label: 'Settings' }
      ]
    }
  ];

  constructor() {
    // Update breadcrumbs on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentRoute = this.router.url;
      const currentNavItem = this.navItems.find(item => item.route === currentRoute);
      if (currentNavItem) {
        this.updateBreadcrumbs(currentNavItem.breadcrumbs);
      }
    });
  }

  updateBreadcrumbs(breadcrumbs: { label: string; link?: string; }[]): void {
    this.breadcrumbService.updateBreadcrumbs(breadcrumbs);
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
