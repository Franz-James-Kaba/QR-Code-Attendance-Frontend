import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { AdminGuard } from '@core/guards/role/role.guard';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },      {
        path: 'dashboard',
        loadComponent: () =>
          import('@Admin/features/dashboard/pages/dashboard/dashboard.component').then(
            m => m.DashboardComponent
          ),
        data: {
          title: 'Overview',
          breadcrumb: 'Overview'
        },
      },
      {
        path: 'nsps',
        data: {
          title: 'NSPs',
          breadcrumb: 'NSPs'
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                '@app/features/Admin/features/dashboard/pages/nsp-overview/nsp-overview.component'
              ).then(m => m.NspOverviewComponent),
            data: {
              title: 'NSPs',
              breadcrumb: 'NSPs'
            },
          },
        ],
      },
      {
        path: 'facilitators',
        data: {
          title: 'Facilitators',
          breadcrumb: 'Facilitators'
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                '@app/features/Admin/features/dashboard/pages/facilitator-overview/facilitator-overview.component'
              ).then(m => m.FacilitatorOverviewComponent),
            data: {
              title: 'Facilitators',
              breadcrumb: 'Facilitators'
            },
          },
        ],
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import(
            '@Admin/features/dashboard/pages/session-management/session-management.component'
          ).then(m => m.SessionManagementComponent),
        data: {
          title: 'Sessions',
          breadcrumb: 'Sessions'
        },
      },
      {
        path: '**',
        loadComponent: () =>
          import('@shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
      },
    ],
  },
];
