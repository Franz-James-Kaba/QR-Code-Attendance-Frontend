import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth/auth.guard';

import { LayoutComponent as AdminLayoutComponent } from './layouts/admin-layout/layout.component';

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
        loadComponent: () => import('@Admin/features/dashboard/pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        data: {
          title: 'Dashboard'
        }
      },
      {
        path: 'users',
        data: {
          title: 'Users'
        },
        children: [
          {
            path: '',
            loadComponent: () => import('@Admin/features/dashboard/pages/user-list/user-list.component')
              .then(m => m.UserListComponent),
            data: {
              title: 'All Users'
            }
          },
          // {
          //   path: ':id',
          //   loadComponent: () => import('@Admin/features/dashboard/pages/user-detail/user-detail.component')
          //     .then(m => m.UserDetailComponent),
          //   data: {
          //     title: 'User Details'
          //   }
          // },
          // {
          //   path: ':id/edit',
          //   loadComponent: () => import('@Admin/features/dashboard/pages/user-edit/user-edit.component')
          //     .then(m => m.UserEditComponent),
          //   data: {
          //     title: 'Edit User'
          //   }
          // }
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('@Admin/features/dashboard/pages/settings/settings.component')
          .then(m => m.SettingsComponent),
        data: {
          title: 'Settings'
        }
      },
      {
        path: '**',
        loadComponent: () => import('@shared/components/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
    ]
  }
];
