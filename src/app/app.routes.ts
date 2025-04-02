import { Routes } from '@angular/router';

import { LayoutComponent as AuthLayoutComponent } from './layouts/auth-layout/layout.component';

export const routes: Routes = [
  // Default route redirects to auth
  {
    path: '',
    redirectTo: 'auth',
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
      .then(m => m.adminRoutes)
  },

  {
    path: 'nsp',
    loadChildren: () => import('./features/NSP/nsp.routes')
      .then(m => m.nspRoutes)
  },

  {
    path: 'facilitator',
    loadChildren: () => import('./features/Facilitator/facilitator.routes')
      .then(m => m.facilitatorRoutes)
  },

  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    title: 'Page Not Found'
  }
];
