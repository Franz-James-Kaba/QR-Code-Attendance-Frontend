import { inject, Injectable } from '@angular/core';
import { DashboardService } from '@app/features/NSP/logic/services/dashboard/dashboard.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  checkIn,
  checkInFailure,
  checkInSuccess,
  checkOut,
  checkOutFailure,
  checkOutSuccess,
  loadAttendanceSummary,
  loadAttendanceSummaryFailure,
  loadAttendanceSummarySuccess,
  selectDate,
} from '@store/actions/attendance.actions';
import { selectSelectedDate } from '@store/selectors/attendance.selectors';
import { of } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class DashboardEffects {
  private readonly actions$: Actions = inject(Actions);
  private readonly dashboardService: DashboardService = inject(DashboardService);
  private readonly store: Store = inject(Store);

  loadAttendanceSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAttendanceSummary, selectDate, checkInSuccess, checkOutSuccess),
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
          map(() => checkInSuccess()),
          catchError(error => of(checkInFailure({ error: error.message })))
        )
      )
    )
  );

  checkOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(checkOut),
      mergeMap(({ sessionCode }) =>
        this.dashboardService.checkOut(sessionCode).pipe(
          map(() => checkOutSuccess()),
          catchError(error => of(checkOutFailure({ error: error.message })))
        )
      )
    )
  );
}
