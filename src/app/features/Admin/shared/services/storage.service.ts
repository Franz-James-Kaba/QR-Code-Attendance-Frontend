import { Injectable } from '@angular/core';

import { Session } from '../models/session/session.model';

interface StoredSession {
  sessionData: Session;
  qrCodeUrl: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly sessionsKey = 'qr_attendance_sessions';

  // Save a session with its QR code to local storage
  saveSession(session: Session, qrCodeUrl: string): void {
    const storedSessions = this.getStoredSessions();
    
    const newStoredSession: StoredSession = {
      sessionData: session,
      qrCodeUrl,
      createdAt: new Date().toISOString(),
    };

    storedSessions.push(newStoredSession);
    localStorage.setItem(this.sessionsKey, JSON.stringify(storedSessions));
  }

  // Get all stored sessions
  getStoredSessions(): StoredSession[] {
    const storedSessionsJson = localStorage.getItem(this.sessionsKey);
    if (!storedSessionsJson) {
      return [];
    }
    try {
      return JSON.parse(storedSessionsJson);
    } catch (error) {
      console.error('Error parsing stored sessions:', error);
      return [];
    }
  }

  // Remove a session
  removeSession(sessionId: string): void {
    const storedSessions = this.getStoredSessions();
    const updatedSessions = storedSessions.filter(
      session => session.sessionData.id !== sessionId
    );
    localStorage.setItem(this.sessionsKey, JSON.stringify(updatedSessions));
  }

  // Clear all sessions
  clearSessions(): void {
    localStorage.removeItem(this.sessionsKey);
  }

  // Convert Blob to data URL
  blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Update an existing session
  updateSession(updatedSession: Session, qrCodeUrl: string): void {
    const storedSessions = this.getStoredSessions();
    const sessionIndex = storedSessions.findIndex(
      session => session.sessionData.id === updatedSession.id
    );
    
    if (sessionIndex !== -1) {
      storedSessions[sessionIndex] = {
        sessionData: updatedSession,
        qrCodeUrl,
        createdAt: storedSessions[sessionIndex].createdAt, // Keep original creation date
      };
      localStorage.setItem(this.sessionsKey, JSON.stringify(storedSessions));
    }
  }
}
