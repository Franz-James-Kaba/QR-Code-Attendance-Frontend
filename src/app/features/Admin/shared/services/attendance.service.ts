import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';

import {
  Attendee,
  EarlyAttendeePagedResponse,
  mapToAttendeeViewModel,
} from '../models/attendee.interface';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get early attendees from the API
   * @param startDate The start date for the search range (format: YYYY-MM-DD)
   * @param endDate The end date for the search range (format: YYYY-MM-DD)
   * @param page Page number (0-based index)
   * @param size Number of attendees per page
   */
  getEarlyAttendees(
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 5
  ): Observable<{ data: Attendee[]; total: number }> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<EarlyAttendeePagedResponse>(`${this.apiUrl}/admin/early-attendees`, { params })
      .pipe(
        map(response => ({
          data: response.content.map(attendee => mapToAttendeeViewModel(attendee)),
          total: response.totalElements,
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Error handling for HTTP requests
   */
  private handleError(
    error: Error | { status: number; error?: { message?: string }; statusText: string }
  ): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if ('error' in error && error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if ('status' in error) {
      // Server-side error
      const status = error.status;
      const message = error.error?.message ?? error.statusText;

      switch (status) {
        case 400:
          errorMessage = `Bad Request: ${message}`;
          break;
        case 401:
          errorMessage = 'Unauthorized: Please log in again';
          break;
        case 403:
          errorMessage = "Forbidden: You don't have permission to perform this action";
          break;
        case 404:
          errorMessage = `Not Found: ${message}`;
          break;
        case 500:
          errorMessage = 'Server Error: Please try again later';
          break;
        default:
          errorMessage = `Error ${status}: ${message}`;
          break;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
