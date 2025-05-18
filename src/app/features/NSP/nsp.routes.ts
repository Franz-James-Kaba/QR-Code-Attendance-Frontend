import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';

export const nspRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: {
      title: 'NSP',
    },
    loadComponent: () =>
      import('@features/NSP/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: 'history',
        canActivate: [AuthGuard],
        data: {
          title: 'NSP - History',
        },
        loadComponent: () =>
          import('@features/NSP/pages/history/history.component').then(m => m.HistoryComponent),
      },
      {
        path: 'leaderboard',
        canActivate: [AuthGuard],
        data: {
          title: 'NSP - Leaderboard',
        },
        loadComponent: () =>
          import('@features/NSP/pages/leaderboard/leaderboard.component').then(
            m => m.LeaderboardComponent
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
