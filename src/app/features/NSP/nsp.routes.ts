import { Routes } from '@angular/router';

export const nspRoutes: Routes = [
      {
        path: '',
        loadComponent: () => import('./nsp.component')
          .then(m => m.NspComponent)
      },
      {
        path: '**',
        loadComponent: () => import('@shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
];
