import { inject, Injectable } from '@angular/core';
import { DashboardService } from '@app/features/NSP/logic/services/dashboard/dashboard.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { NotificationService } from '@shared/services/notification.service';
import {
  checkIn,
  checkOut,
  loadAttendanceSummary,
  loadAttendanceSummaryFailure,
  loadAttendanceSummarySuccess,
  selectDate,
} from '@store/actions/attendance.actions';
import { AuthActions } from '@store/actions/auth.actions';
import { selectSelectedDate } from '@store/selectors/attendance.selectors';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class DashboardEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly dashboardService: DashboardService = inject(DashboardService);
  private readonly store: Store = inject(Store);
  private readonly notificationService = inject(NotificationService);

  loadAttendanceSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAttendanceSummary, selectDate, checkIn, checkOut),
      withLatestFrom(this.store.select(selectSelectedDate)),
      mergeMap(([_, selectedDate]) =>
        this.dashboardService.getAttendanceSummaryData(selectedDate).pipe(
          map(summary => loadAttendanceSummarySuccess({ summary })),
          catchError(error => of(loadAttendanceSummaryFailure({ error: error.message })))
        )
      )
    )
  );

  checkIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(checkIn),
      mergeMap(({ sessionCode }) =>
        this.dashboardService.checkIn(sessionCode).pipe(
          tap(() => this.notificationService.success('Checked in successfully')),
          map(() => AuthActions.fetchUserProfile()),
          catchError(error =>
            of(loadAttendanceSummaryFailure({ error: `Check-in failed: ${error.message}` }))
          )
        )
      )
    )
  );

  checkOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(checkOut),
      mergeMap(({ sessionCode }) =>
        this.dashboardService.checkOut(sessionCode).pipe(
          tap(() => this.notificationService.success('Checked out successfully')),
          map(() => AuthActions.fetchUserProfile()),
          catchError(error =>
            of(loadAttendanceSummaryFailure({ error: `Check-out failed: ${error.message}` }))
          )
        )
      )
    )
  );
}
