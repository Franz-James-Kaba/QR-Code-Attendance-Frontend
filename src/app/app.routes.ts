import { Routes } from '@angular/router';

import { AdminRoutesComponent } from './Admin/admin-routes/admin-routes.component';
import { adminRoutes } from './Admin/admin.routes';

export const routes: Routes = [
  // Public authentication routes
  {
    path: 'auth',
    loadChildren: () => import('./Admin/admin.routes').then(m => m.authRoutes)
  },

  // Protected admin routes
  {
    path: 'admin',
    component: AdminRoutesComponent,
    children: adminRoutes,
  },

  // Default redirects
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () => import('./Admin/shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  },
];
