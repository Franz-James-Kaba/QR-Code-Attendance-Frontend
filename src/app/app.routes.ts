import { Routes } from '@angular/router';

import { LayoutComponent as AuthLayoutComponent } from './layouts/auth-layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./shared/components/auth/pages/login/login.component')
          .then(m => m.LoginComponent),
        title: 'Login'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./shared/components/auth/pages/forgot-password/forgot-password.component')
          .then(m => m.ForgotPasswordComponent),
        title: 'Forgot Password'
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./shared/components/auth/pages/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent),
        title: 'Reset Password'
      }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/Admin/admin.routes')
      .then(r => r.adminRoutes),
    data: {
      title: 'Admin'
    }
  },
  {
    path: 'nsp',
    loadChildren: () => import('./features/NSP/nsp.routes')
      .then(r => r.nspRoutes),
    data: {
      title: 'NSP'
    }
  },
  {
    path: 'facilitator',
    loadChildren: () => import('./features/Facilitator/facilitator.routes')
      .then(r => r.facilitatorRoutes),
    data: {
      title: 'Facilitator'
    }
  },
  {
    path: '**',
    loadComponent: () => import('@shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
