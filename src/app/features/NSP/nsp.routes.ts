import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';

import { NspLayoutComponent } from './layouts/nsp-layout/nsp-layout.component';

export const nspRoutes: Routes = [
  {
    path: '',
    component: NspLayoutComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'NSP'
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      // {
      //   path: 'dashboard',
      //   loadComponent: () => import('@NSP/features/dashboard/pages/dashboard/dashboard.component')
      //     .then(m => m.DashboardComponent),
      //   data: {
      //     title: 'Dashboard'
      //   }
      // },
      // {
      //   path: 'events',
      //   loadComponent: () => import('@NSP/features/events/pages/events-list/events-list.component')
      //     .then(m => m.EventsListComponent),
      //   data: {
      //     title: 'Events'
      //   }
      // },
      // {
      //   path: 'reports',
      //   loadComponent: () => import('@NSP/features/reports/pages/reports/reports.component')
      //     .then(m => m.ReportsComponent),
      //   data: {
      //     title: 'Reports'
      //   }
      // },
      {
        path: '**',
        loadComponent: () => import('@shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
    ]
  }
];
