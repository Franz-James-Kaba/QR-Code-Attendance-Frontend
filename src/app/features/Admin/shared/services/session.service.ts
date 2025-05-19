import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';

import {
  CreateSessionRequest,
  Session,
  SessionFilter,
  SessionListResponse,
  SessionStatus,
  UpdateSessionRequest,
} from '../models/session/session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/session`;
  private readonly adminApiUrl = `${environment.apiUrl}/admin/sessions`;

  // Get all sessions with optional filters
  getSessions(filter?: SessionFilter): Observable<SessionListResponse> {
    let params = new HttpParams();

    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    }

    return this.http
      .get<SessionListResponse>(`${this.adminApiUrl}`, { params })
      .pipe(
        catchError(error =>
          throwError(() => new Error(`Error fetching sessions: ${error.message}`))
        )
      );
  }

  // Get session by ID
  getSessionById(id: string): Observable<Session> {
    return this.http
      .get<Session>(`${this.adminApiUrl}/${id}`)
      .pipe(
        catchError(error => throwError(() => new Error(`Error fetching session: ${error.message}`)))
      );
  }

  // Create a new session
  createSession(session: CreateSessionRequest): Observable<Session> {
    return this.http
      .post<Session>(`${this.adminApiUrl}`, session)
      .pipe(
        catchError(error => throwError(() => new Error(`Error creating session: ${error.message}`)))
      );
  }

  // Update a session
  updateSession(sessionId: string, updates: UpdateSessionRequest): Observable<Session> {
    return this.http
      .put<Session>(`${this.adminApiUrl}/${sessionId}`, updates)
      .pipe(
        catchError(error => throwError(() => new Error(`Error updating session: ${error.message}`)))
      );
  }

  // Cancel a session
  cancelSession(sessionId: string): Observable<Session> {
    return this.http
      .put<Session>(`${this.adminApiUrl}/${sessionId}/cancel`, {})
      .pipe(
        catchError(error =>
          throwError(() => new Error(`Error cancelling session: ${error.message}`))
        )
      );
  }

  // Generate QR code for a session
  generateQrCode(sessionId: string, width: number = 300, height: number = 300): Observable<string> {
    const params = new HttpParams().set('width', width.toString()).set('height', height.toString());

    // Return observable that resolves to QR code image URL
    return this.http
      .post<Blob>(
        `${this.apiUrl}/generate-qrcode`,
        { sessionId },
        { params, responseType: 'blob' as 'json', observe: 'response' }
      )
      .pipe(
        map(response => {
          // Convert blob to object URL
          const blob = response.body;
          return blob ? URL.createObjectURL(blob) : '';
        }),
        catchError(error =>
          throwError(() => new Error(`Error generating QR code: ${error.message}`))
        )
      );
  }

  // Get color for session status (for UI display)
  getStatusColor(status: SessionStatus): string {
    switch (status) {
      case 'SCHEDULED':
        return 'blue';
      case 'ONGOING':
        return 'green';
      case 'COMPLETED':
        return 'gray';
      case 'CANCELLED':
        return 'red';
      default:
        return 'gray';
    }
  }

  // Format date string to human-readable format
  formatSessionTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
