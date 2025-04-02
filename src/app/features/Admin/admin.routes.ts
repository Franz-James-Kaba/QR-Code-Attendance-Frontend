import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
      {
        path: '',
        loadComponent: () => import('./admin.component')
          .then(m => m.AdminComponent)
      },
      {
        path: '**',
        loadComponent: () => import('@shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
];
