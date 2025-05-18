import { DashboardState } from '@app/features/NSP/models/nsp.interface';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');

export const selectAttendanceSummary = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.attendanceSummary
);

export const selectIsCheckedIn = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.isCheckedIn
);

export const selectSelectedDate = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.selectedDate
);

export const selectError = createSelector(
  selectDashboardState,
  (state: DashboardState) => state.error
);
