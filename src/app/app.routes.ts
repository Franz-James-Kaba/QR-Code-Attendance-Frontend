import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./layouts/auth-layout/layout.component')
      .then(m => m.LayoutComponent),
    data: {
      title: 'Authentication'
    }
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/Admin/admin.routes')
      .then(m => m.adminRoutes),
    data: {
      title: 'Admin'
    }
  },
  {
    path: 'nsp',
    loadChildren: () => import('./features/NSP/nsp.routes')
      .then(m => m.nspRoutes),
    data: {
      title: 'NSP'
    }
  },
  {
    path: 'facilitator',
    loadChildren: () => import('./features/Facilitator/facilitator.routes')
      .then(m => m.facilitatorRoutes),
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
