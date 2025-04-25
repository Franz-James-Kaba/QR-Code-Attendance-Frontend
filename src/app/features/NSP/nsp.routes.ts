import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';
import { NspComponent } from '@features/NSP/nsp.component';

export const nspRoutes: Routes = [
  {
    path: 'dashboard',
    component: NspComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'NSP'
    }
  },
  {
    path: '**',
    loadComponent: () => import('@shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
