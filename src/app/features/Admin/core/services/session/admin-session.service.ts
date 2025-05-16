import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Session,
  SessionListResponse,
  CreateSessionRequest,
  UpdateSessionRequest,
  SessionFilter,
} from '@features/Admin/shared/models/session/session.model';
import { Observable, throwError, catchError } from 'rxjs';

import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminSessionService {
  private readonly API_URL = `${environment.admin.baseUrl}/sessions`;
  private readonly http = inject(HttpClient);

  /**
   * Get all sessions with optional filtering
   */
  getSessions(filter: SessionFilter = {}): Observable<SessionListResponse> {
    let params = new HttpParams();

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http
      .get<SessionListResponse>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a specific session by ID
   */
  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.API_URL}/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * Create a new session
   */
  createSession(sessionData: CreateSessionRequest): Observable<Session> {
    return this.http.post<Session>(this.API_URL, sessionData).pipe(catchError(this.handleError));
  }

  /**
   * Update an existing session
   */
  updateSession(sessionId: number, sessionData: UpdateSessionRequest): Observable<Session> {
    return this.http
      .patch<Session>(`${this.API_URL}/${sessionId}`, sessionData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.API_URL}/${sessionId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Start a session (change status to ONGOING)
   */
  startSession(sessionId: number): Observable<Session> {
    return this.http
      .post<Session>(`${this.API_URL}/${sessionId}/start`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * End a session (change status to COMPLETED)
   */
  endSession(sessionId: number): Observable<Session> {
    return this.http
      .post<Session>(`${this.API_URL}/${sessionId}/end`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Cancel a session (change status to CANCELLED)
   */
  cancelSession(sessionId: number): Observable<Session> {
    return this.http
      .post<Session>(`${this.API_URL}/${sessionId}/cancel`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Get the QR code for a session
   */
  getSessionQrCode(sessionId: number): Observable<{ qrCodeUrl: string }> {
    return this.http
      .get<{ qrCodeUrl: string }>(`${this.API_URL}/${sessionId}/qr-code`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get attendance records for a session
   */
  getSessionAttendance(sessionId: number): Observable<any> {
    return this.http
      .get<any>(`${this.API_URL}/${sessionId}/attendance`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to manage sessions.';
      } else if (error.status === 404) {
        errorMessage = 'The requested session was not found.';
      } else if (error.status === 409) {
        errorMessage = 'A scheduling conflict occurred with another session.';
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
