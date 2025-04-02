import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';

import { LayoutComponent as AdminLayoutComponent } from './layouts/admin-layout/layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('@Admin/features/dashboard/pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        data: {
          title: 'Dashboard',
          breadcrumbs: [{ label: 'Dashboard', link: '/admin/dashboard' }]
        }
      },
      {
        path: 'users',
        loadComponent: () => import('@Admin/features/dashboard/pages/user-list/user-list.component')
          .then(m => m.UserListComponent),
        data: {
          title: 'Users',
          breadcrumbs: [{ label: 'Users', link: '/admin/users' }]
        }
      },
      {
        path: 'settings',
        loadComponent: () => import('@Admin/features/dashboard/pages/settings/settings.component')
          .then(m => m.SettingsComponent),
        data: {
          title: 'Settings',
          breadcrumbs: [{ label: 'Settings', link: '/admin/settings' }]
        }
      },
      {
        path: '**',
        loadComponent: () => import('@shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
    ]
  }
];
