import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { AdminGuard } from '@core/guards/role/role.guard';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard], // Add AdminGuard to ensure only admin users can access
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
          title: 'Dashboard'
        }
      },
      // {
      //   path: 'users',
      //   loadComponent: () => import('@Admin/features/dashboard/pages/user-management/user-management.component')
      //     .then(m => m.UserManagementComponent),
      //   data: {
      //     title: 'User Management'
      //   }
      // },
      {
        path: 'nsps',
        data: {
          title: 'NSP Management'
        },
        children: [
          {
            path: '',
            loadComponent: () => import('@app/features/Admin/features/dashboard/pages/nsp-overview/nsp-overview.component')
              .then(m => m.NspOverviewComponent),
            data: {
              title: 'NSP Overview'
            }
          }
        ]
      },
      {
        path: 'facilitators',
        data: {
          title: 'Facilitator Management'
        },
        children: [
          {
            path: '',
            loadComponent: () => import('@app/features/Admin/features/dashboard/pages/facilitator-overview/facilitator-overview.component')
              .then(m => m.FacilitatorOverviewComponent),
            data: {
              title: 'Facilitator Overview'
            }
          }
        ]
      },
      {
        path: 'sessions',
        loadComponent: () => import('@Admin/features/dashboard/pages/session-management/session-management.component')
          .then(m => m.SessionManagementComponent),
        data: {
          title: 'Session Management'
        }
      },
      {
        path: 'settings',
        loadComponent: () => import('@Admin/features/dashboard/pages/settings/settings.component')
          .then(m => m.SettingsComponent),
        data: {
          title: 'Settings'
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
