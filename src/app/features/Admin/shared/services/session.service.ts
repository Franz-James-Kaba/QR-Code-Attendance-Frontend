import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

import {
  Session,
  SessionRequest,
  SessionQRCodeRequest,
  SessionResponse
} from '../models/session/session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/session`;

  // Get all sessions
  getAllSessions(): Observable<Session[]> {
    return this.http
      .get<Session[]>(`${this.apiUrl}`)
      .pipe(
        catchError(error =>
          throwError(() => new Error(`Error fetching sessions: ${error.message}`))
        )
      );
  }

  // Get active sessions
  getActiveSessions(): Observable<Session[]> {
    return this.http
      .get<Session[]>(`${this.apiUrl}/active`)
      .pipe(
        catchError(error =>
          throwError(() => new Error(`Error fetching active sessions: ${error.message}`))
        )
      );
  }

  // Get inactive sessions
  getInactiveSessions(): Observable<Session[]> {
    return this.http
      .get<Session[]>(`${this.apiUrl}/inactive`)
      .pipe(
        catchError(error =>
          throwError(() => new Error(`Error fetching inactive sessions: ${error.message}`))
        )
      );
  }

  // Get session by ID
  getSessionById(id: number): Observable<Session> {
    return this.http
      .get<Session>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => throwError(() => new Error(`Error fetching session: ${error.message}`)))
      );
  }

  // Create a new session
  createSession(session: SessionRequest): Observable<SessionResponse> {
    return this.http
      .post<SessionResponse>(`${this.apiUrl}`, session)
      .pipe(
        catchError(error => throwError(() => new Error(`Error creating session: ${error.message}`)))
      );
  }

  // Update a session
  updateSession(sessionId: number, updates: SessionRequest): Observable<SessionResponse> {
    return this.http
      .put<SessionResponse>(`${this.apiUrl}/${sessionId}`, updates)
      .pipe(
        catchError(error => throwError(() => new Error(`Error updating session: ${error.message}`)))
      );
  }

  // Delete a session
  deleteSession(sessionId: number): Observable<SessionResponse> {
    return this.http
      .delete<SessionResponse>(`${this.apiUrl}/${sessionId}`)
      .pipe(
        catchError(error =>
          throwError(() => new Error(`Error deleting session: ${error.message}`))
        )
      );
  }

  // Generate QR code for a session
  generateQrCode(request: SessionQRCodeRequest): Observable<Blob> {
    let params = new HttpParams();
    if (request.width) params = params.set('width', request.width.toString());
    if (request.height) params = params.set('height', request.height.toString());

    return this.http
      .post(`${this.apiUrl}/generate-qrcode`, request, {
        responseType: 'blob',
        params
      })
      .pipe(
        catchError(error =>
          throwError(() => new Error(`Error generating QR code: ${error.message}`))
        )
      );
  }

  // QR Code storage methods
  private getQrCodeKey(sessionId: number): string {
    return `session_qr_${sessionId}`;
  }

  storeQrCode(sessionId: number, qrBlob: Blob): void {
    const reader = new FileReader();
    reader.readAsDataURL(qrBlob);
    reader.onloadend = () => {
      localStorage.setItem(this.getQrCodeKey(sessionId), reader.result as string);
    };
  }

  getStoredQrCode(sessionId: number): string | null {
    return localStorage.getItem(this.getQrCodeKey(sessionId));
  }

  removeStoredQrCode(sessionId: number): void {
    localStorage.removeItem(this.getQrCodeKey(sessionId));
  }

  hasStoredQrCode(sessionId: number): boolean {
    return !!this.getStoredQrCode(sessionId);
  }

  // Get color for session status (for UI display)
  getStatusColor(status: boolean): string {
    return status ? 'text-green-600' : 'text-red-600';
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
