import { SummaryCard } from '@app/features/NSP/models/nsp.interface';
import { createAction, props } from '@ngrx/store';

export const selectDate = createAction('[Dashboard] Select Date', props<{ date: Date }>());

export const loadAttendanceSummary = createAction('[Dashboard] Load Attendance Summary');

export const loadAttendanceSummarySuccess = createAction(
  '[Dashboard] Load Attendance Summary Success',
  props<{ summary: SummaryCard[] }>()
);

export const loadAttendanceSummaryFailure = createAction(
  '[Dashboard] Load Attendance Summary Failure',
  props<{ error: string }>()
);

export const checkIn = createAction('[Dashboard] Check In', props<{ sessionCode: string }>());

export const checkOut = createAction('[Dashboard] Check Out', props<{ sessionCode: string }>());
