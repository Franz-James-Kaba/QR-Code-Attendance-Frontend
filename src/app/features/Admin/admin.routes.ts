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
          title: 'Dashboard'
        }
      },
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
