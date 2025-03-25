import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent as AdminLayoutComponent } from './layouts/admin-layout/layout.component';
import { LayoutComponent as AuthLayoutComponent } from './layouts/auth-layout/layout.component';

// Authentication routes - exported separately for lazy loading
export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
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
  }
];

// Admin routes - these require authentication
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
          loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
          data: { title: 'Dashboard', breadcrumb: 'Dashboard' }
        },
        // Other routes like users would be defined here with the same pattern
        // {
        //   path: 'users',
        //   loadComponent: () => import('./path/to/users/component')
        //     .then(m => m.UsersComponent),
        //   data: { title: 'Users', breadcrumb: 'Users' }
        // },
        {
          path: '**',
          loadComponent: () => import('./shared/components/not-found/not-found.component')
            .then(m => m.NotFoundComponent)
        }
      ]
    }
];
