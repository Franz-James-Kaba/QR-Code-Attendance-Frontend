import { initialState } from '@app/features/NSP/models/nsp.interface';
import { createReducer, on } from '@ngrx/store';
import {
  checkInFailure,
  checkInSuccess,
  checkOutFailure,
  checkOutSuccess,
  loadAttendanceSummaryFailure,
  loadAttendanceSummarySuccess,
  selectDate,
} from '@store/actions/attendance.actions';

export const dashboardReducer = createReducer(
  initialState,
  on(selectDate, (state, { date }) => ({
    ...state,
    selectedDate: date,
  })),
  on(loadAttendanceSummarySuccess, (state, { summary }) => ({
    ...state,
    attendanceSummary: summary,
    error: null,
  })),
  on(loadAttendanceSummaryFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(checkInSuccess, state => ({
    ...state,
    isCheckedIn: true,
    error: null,
  })),
  on(checkInFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(checkOutSuccess, state => ({
    ...state,
    isCheckedIn: false,
    error: null,
  })),
  on(checkOutFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
