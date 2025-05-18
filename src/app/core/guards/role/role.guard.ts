import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { UserRole } from '@shared/models/auth/auth.model';
import { selectCurrentUserRole, selectIsAuthenticated } from '@store/selectors/auth.selectors';
import { map, take, switchMap } from 'rxjs/operators';

export const RoleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const store = inject(Store);

    return store.select(selectIsAuthenticated).pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url },
          });
          return [false];
        }

        return store.select(selectCurrentUserRole).pipe(
          take(1),
          map(role => {
            if (!role || !allowedRoles.includes(role)) {
              router.navigate(['/unauthorized']);
              return false;
            }
            return true;
          })
        );
      })
    );
  };
};

export const AdminGuard: CanActivateFn = RoleGuard(['ADMIN']);
export const FacilitatorGuard: CanActivateFn = RoleGuard(['FACILITATOR']);
export const NSPGuard: CanActivateFn = RoleGuard(['NSP']);
export const AdminOrFacilitatorGuard: CanActivateFn = RoleGuard(['ADMIN', 'FACILITATOR']);
