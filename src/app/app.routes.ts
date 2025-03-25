import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'nsp-dashboard',
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['nsp'] },
    loadComponent: () => import('./pages/nsps/dashboard.component').then(m => m.DashboardComponent)
  },
];
