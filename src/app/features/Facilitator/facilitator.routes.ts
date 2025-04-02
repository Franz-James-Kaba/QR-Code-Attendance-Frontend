import { Routes } from '@angular/router';

export const facilitatorRoutes: Routes = [
      {
        path: '',
        loadComponent: () => import('./facilitator.component')
          .then(m => m.FacilitatorComponent)
      },
      {
        path: '**',
        loadComponent: () => import('@shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
];
