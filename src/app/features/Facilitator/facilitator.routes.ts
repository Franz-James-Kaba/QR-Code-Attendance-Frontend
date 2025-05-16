import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';

import { FacilitatorLayoutComponent } from './layouts/facilitator-layout/facilitator-layout.component';

export const facilitatorRoutes: Routes = [
  {
    path: '',
    component: FacilitatorLayoutComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Facilitator',
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      // {
      //   path: 'dashboard',
      //   loadComponent: () => import('@Facilitator/features/dashboard/pages/dashboard/dashboard.component')
      //     .then(m => m.DashboardComponent),
      //   data: {
      //     title: 'Dashboard'
      //   }
      // },
      // {
      //   path: 'attendance',
      //   loadComponent: () => import('@Facilitator/features/attendance/pages/attendance/attendance.component')
      //     .then(m => m.AttendanceComponent),
      //   data: {
      //     title: 'Attendance'
      //   }
      // },
      // {
      //   path: 'sessions',
      //   loadComponent: () => import('@Facilitator/features/sessions/pages/sessions/sessions.component')
      //     .then(m => m.SessionsComponent),
      //   data: {
      //     title: 'Sessions'
      //   }
      // },
      {
        path: '**',
        loadComponent: () =>
          import('@shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
      },
    ],
  },
];
