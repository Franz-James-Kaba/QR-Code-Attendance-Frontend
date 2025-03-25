import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent as AdminLayoutComponent } from './layouts/admin-layout/layout.component';
import { LayoutComponent } from './layouts/auth-layout/layout.component';

export const adminRoutes: Routes = [
  {
    path: 'auth',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login.component')
          .then(m => m.LoginComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/pages/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password.component')
          .then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./shared/components/unauthorized/unauthorized.component')
          .then(m => m.UnauthorizedComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        data: { title: 'Dashboard' }
      },
      {
        path: '**',
        loadComponent: () => import('./shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
